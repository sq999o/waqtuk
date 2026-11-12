import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';
import { myRequests, mentorRequests, sharedStudents, getSharedData } from '../src/context/selectors/accounts.js';
import { acceptRequest, cancelRequest, revokeAccess } from '../src/context/actions/sharing.js';

const read = name => JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url)));
const data = { users: read('users'), goals: read('goals'), categories: read('categories'), activities: read('activities'), sharingRequests: read('sharing') };
const ctx = id => ({ currentUser: data.users.find(user => user.id === id) });
let passed = 0;
function test(name, run) { run(); passed++; console.log(`PASS: ${name}`); }
test('all seven agreed requests reference real users and owned goals in the approved range', () => {
  assert.equal(data.sharingRequests.length, 7);
  assert.equal(new Set(data.sharingRequests.map(r => r.id)).size, 7);
  for (const r of data.sharingRequests) {
    assert.equal(ctx(r.studentId).currentUser.role, 'student'); assert.equal(ctx(r.mentorId).currentUser.role, 'mentor');
    for (const id of r.goalIds) {
      const goal = data.goals.find(g => g.id === id);
      assert.ok(goal); assert.equal(goal.studentId, r.studentId);
      assert.ok(goal.weekStart >= r.from && goal.weekStart <= r.to);
    }
  }
  assert.deepEqual(data.sharingRequests.find(r => r.id === 'r3').goalIds, ['g7', 'g8']);
  assert.deepEqual(data.sharingRequests.find(r => r.id === 'r7').goalIds, ['g6']);
});
test('student A has the two agreed requests; Mentor A has 2 pending, 3 accepted and 1 declined', () => {
  assert.deepEqual(myRequests(data, ctx('s1')).map(r => r.id), ['r1', 'r2']);
  const requests = mentorRequests(data, ctx('m1'));
  assert.deepEqual(['pending', 'accepted', 'declined'].map(s => requests.filter(r => r.status === s).length), [2, 3, 1]);
  assert.equal(sharedStudents(data, ctx('m1')).reduce((sum, row) => sum + row.request.goalIds.length, 0), 3);
  assert.deepEqual(sharedStudents(data, ctx('m2')), []);
});
test('historical accepted sharing is readable and seeds respect scope and live participants', () => {
  assert.equal(getSharedData(data, ctx('m1'))('r3').goals.length, 2);
  assert.equal(getSharedData(data, ctx('m1'))('r4').goals.length, 0);
  assert.equal(getSharedData(data, ctx('m1'))('r5').student, undefined);
  assert.equal(getSharedData(data, ctx('m2'))('r2').student, undefined);
  assert.equal(getSharedData(data, ctx('m2'))('r1').student, undefined);
});
test('seed requests can be accepted, cancelled and revoked through the real actions', () => {
  for (const id of ['r6', 'r7']) assert.equal(acceptRequest(data, id, ctx('m1')).result.ok, true);
  const cancelled = cancelRequest(data, 'r2', ctx('s1'));
  assert.equal(cancelled.result.request.status, 'cancelled'); assert.equal(data.sharingRequests[1].status, 'pending');
  const revoked = revokeAccess(data, 'r1', ctx('s1'));
  assert.equal(getSharedData(revoked.data, ctx('m1'))('r1').student, undefined);
});

const root = fileURLToPath(new URL('../', import.meta.url));
const server = await createServer({ root, server: { middlewareMode: true }, appType: 'custom' });
const previousStorage = globalThis.localStorage, originalError = console.error, errors = [];
globalThis.localStorage = { getItem: key => key === 'waqtuk.session' ? JSON.stringify({ userId: 's1', role: 'student' }) : null };
console.error = (...args) => errors.push(args.join(' '));
try {
  const { AuthProvider } = await server.ssrLoadModule('/src/context/AuthContext.jsx');
  const { DataProvider } = await server.ssrLoadModule('/src/context/DataContext.jsx');
  const { ToastProvider } = await server.ssrLoadModule('/src/context/ToastContext.jsx');
  const { default: Sharing } = await server.ssrLoadModule('/src/pages/student/Sharing.jsx');
  const html = renderToStaticMarkup(h(MemoryRouter, null, h(ToastProvider, null, h(AuthProvider, null, h(DataProvider, null, h(Sharing))))));
  test('sharing page renders real mentor choices, current-week goals and exact prototype text', () => {
    for (const text of ['New sharing request', 'Existing access', 'Private notes always stay hidden from mentors.', 'Review Scope', 'Send Request', 'Cancel Pending Request', 'Revoke Access', 'Changing the scope replaces all current access with a new pending request.']) assert.ok(html.includes(text), text);
    for (const id of ['m1', 'm2', 'm3']) assert.ok(html.includes(`value="${id}"`));
    for (const id of ['g1', 'g2', 'g3', 'g4']) assert.ok(html.includes(`name="${id}"`));
    assert.ok(!html.includes('name="g5"'));
    assert.ok(html.indexOf('data-request-id="r2"') < html.indexOf('data-request-id="r1"'));
    assert.ok(!html.includes('Password1')); assert.deepEqual(errors, []);
  });
  console.log(`PASS: all ${passed} sharing page and seed test groups; live references, consent and page rendering.`);
} finally { globalThis.localStorage = previousStorage; console.error = originalError; await server.close(); }
