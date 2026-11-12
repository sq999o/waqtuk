import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';
import { updateUser, setUserStatus, login } from '../src/context/actions/accounts.js';
import { sharedStudents } from '../src/context/selectors/accounts.js';
import { messages as M } from '../src/utils/validators/account.js';

const read = name => JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url)));
const seed = { users: read('users'), goals: read('goals'), activities: read('activities'), sharingRequests: read('sharing') };
const ctx = id => ({ currentUser: seed.users.find(user => user.id === id) });
let passed = 0;
function test(name, run) { run(); passed++; console.log(`PASS: ${name}`); }
test('admin editing preserves identity, password, role and mentor alias', () => {
  const result = updateUser(seed, 's1', { name: ' Updated Student ', email: ' UPDATED@EXAMPLE.COM ' }, ctx('a1'));
  assert.equal(result.result.ok, true);
  assert.equal(result.result.user.name, 'Updated Student');
  assert.equal(result.result.user.email, 'updated@example.com');
  for (const key of ['id', 'password', 'role', 'mentorName', 'status']) assert.equal(result.result.user[key], seed.users[0][key]);
  assert.equal(seed.users[0].email, 'student@example.com');
});
test('invalid email and duplicate email return the exact prototype messages', () => {
  assert.equal(updateUser(seed, 's1', { email: 'invalid' }, ctx('a1')).result.error, M.accountInvalidEmail);
  assert.equal(updateUser(seed, 's1', { email: 'mentor@example.com' }, ctx('a1')).result.error, M.accountDuplicateEmail);
});
test('suspension requires a reason and revokes access; reactivation never restores consent', () => {
  assert.equal(setUserStatus(seed, 's1', 'suspended', ' ', ctx('a1')).result.error, M.accountReasonRequired);
  const suspended = setUserStatus(seed, 's1', 'suspended', 'Review', ctx('a1'));
  assert.equal(suspended.result.ok, true);
  assert.equal(login(suspended.data, 'student@example.com', 'Password1', {}).result.error, M.accountSuspended);
  assert.equal(suspended.data.sharingRequests.find(r => r.id === 'r1').status, 'revoked');
  assert.equal(suspended.data.sharingRequests.find(r => r.id === 'r2').status, 'cancelled');
  const restored = setUserStatus(suspended.data, 's1', 'active', 'Resolved', ctx('a1'));
  assert.equal(login(restored.data, 'student@example.com', 'Password1', {}).result.ok, true);
  assert.ok(!sharedStudents(restored.data, ctx('m1')).some(row => row.student.id === 's1'));
});
test('other roles cannot edit users or change status', () => {
  for (const id of ['s1', 'm1']) {
    assert.equal(updateUser(seed, 's2', { name: 'Forbidden' }, ctx(id)).result.ok, false);
    assert.equal(setUserStatus(seed, 's2', 'suspended', 'Forbidden', ctx(id)).result.ok, false);
  }
});
const server = await createServer({ root: fileURLToPath(new URL('../', import.meta.url)), server: { middlewareMode: true }, appType: 'custom' });
const previous = globalThis.localStorage;
let actor = 'a1';
globalThis.localStorage = { getItem: key => key === 'waqtuk.session' ? JSON.stringify({ userId: actor, role: ctx(actor).currentUser.role }) : null };
try {
  const { AuthProvider } = await server.ssrLoadModule('/src/context/AuthContext.jsx');
  const { DataProvider } = await server.ssrLoadModule('/src/context/DataContext.jsx');
  const { ToastProvider } = await server.ssrLoadModule('/src/context/ToastContext.jsx');
  const Page = (await server.ssrLoadModule('/src/pages/admin/AdminUsers.jsx')).default;
  const render = () => renderToStaticMarkup(h(MemoryRouter, null, h(ToastProvider, null, h(AuthProvider, null, h(DataProvider, null, h(Page))))));
  test('admin page renders live accounts, filters, editable fields and read-only role/status', () => {
    const html = render();
    for (const text of ['User management', 'Accounts', 'Account details', 'All roles', 'All statuses', 'Save Changes', 'Status management', 'Reactivate', 'Suspend', 'student@example.com']) assert.ok(html.includes(text), text);
    assert.ok(/readonly=""/i.test(html));
    assert.ok(!html.includes('Password1'));
    assert.ok(!html.includes('admin@example.com'));
  });
  test('rendering the page as a student exposes no account list', () => {
    actor = 's1'; const html = render();
    assert.ok(html.includes(M.accountNotAllowed));
    assert.ok(!html.includes('mentor@example.com'));
  });
  console.log(`PASS: all ${passed} admin user page test groups; edits, status, consent and rendering.`);
} finally { globalThis.localStorage = previous; await server.close(); }
