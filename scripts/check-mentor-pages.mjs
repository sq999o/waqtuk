import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';
import { mentorRequests, sharedStudents, getSharedData } from '../src/context/selectors/accounts.js';
import { acceptRequest, declineRequest, endSharing } from '../src/context/actions/sharing.js';

const read = name => JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url)));
const data = { users: read('users'), goals: read('goals'), categories: read('categories'), activities: read('activities'), sharingRequests: read('sharing') };
const ctx = id => ({ currentUser: data.users.find(user => user.id === id) });
let passed = 0;
function test(name, run) { run(); passed++; console.log(`PASS: ${name}`); }

test('Mentor A starts with the agreed request, student and goal totals', () => {
  const requests = mentorRequests(data, ctx('m1'));
  assert.deepEqual(['pending', 'accepted', 'declined'].map(status => requests.filter(request => request.status === status).length), [2, 3, 1]);
  const students = sharedStudents(data, ctx('m1'));
  assert.equal(students.length, 3);
  assert.equal(students.reduce((sum, row) => sum + row.request.goalIds.length, 0), 3);
  assert.equal(students.filter(row => row.request.to <= '2026-11-07').length, 1);
});

test('mentor decisions use the real transitions and preserve the source', () => {
  const accepted = acceptRequest(data, 'r6', ctx('m1'));
  const declined = declineRequest(data, 'r7', ctx('m1'));
  assert.equal(accepted.result.request.status, 'accepted');
  assert.equal(declined.result.request.status, 'declined');
  assert.equal(data.sharingRequests.find(request => request.id === 'r6').status, 'pending');
  assert.equal(data.sharingRequests.find(request => request.id === 'r7').status, 'pending');
});

test('ending sharing removes access and leaves unrelated students available', () => {
  const ended = endSharing(data, 'r1', ctx('m1'));
  assert.equal(ended.result.request.status, 'ended');
  assert.equal(getSharedData(ended.data, ctx('m1'))('r1').student, undefined);
  assert.deepEqual(sharedStudents(ended.data, ctx('m1')).map(row => row.request.id), ['r3', 'r4']);
});

const root = fileURLToPath(new URL('../', import.meta.url));
const server = await createServer({ root, server: { middlewareMode: true }, appType: 'custom' });
const previousStorage = globalThis.localStorage, originalError = console.error, errors = [];
globalThis.localStorage = { getItem: key => key === 'waqtuk.session' ? JSON.stringify({ userId: 'm1', role: 'mentor' }) : null };
console.error = (...args) => errors.push(args.join(' '));
try {
  const { AuthProvider } = await server.ssrLoadModule('/src/context/AuthContext.jsx');
  const { DataProvider } = await server.ssrLoadModule('/src/context/DataContext.jsx');
  const { ToastProvider } = await server.ssrLoadModule('/src/context/ToastContext.jsx');
  const render = async path => {
    const Page = (await server.ssrLoadModule(path)).default;
    return renderToStaticMarkup(h(MemoryRouter, null, h(ToastProvider, null, h(AuthProvider, null, h(DataProvider, null, h(Page))))));
  };
  const home = await render('/src/pages/mentor/MentorHome.jsx');
  const requests = await render('/src/pages/mentor/MentorRequests.jsx');
  const students = await render('/src/pages/mentor/MentorStudents.jsx');
  test('mentor home renders the queue, safe access summary and empty announcements', () => {
    for (const text of ['Mentor home', 'Sharing requests', 'Shared students', 'Student D', 'Student F', 'Next in queue', 'Open Overview', 'End Sharing', 'No announcements for mentors.']) assert.ok(home.includes(text), text);
  });
  test('request page renders every pending request and the three recent decisions', () => {
    for (const text of ['Accepted this term', 'Recent decisions', 'Student D', 'Student F', 'Student B', 'Student C', 'Student E', 'Decline']) assert.ok(requests.includes(text), text);
  });
  test('shared students page renders filters, approved rows and actions without private fields', () => {
    for (const text of ['Goals shared', 'Ending soon', 'All scopes', 'Student A', 'Student B', 'Student C', 'Open', 'End']) assert.ok(students.includes(text), text);
    assert.ok(!`${home}${requests}${students}`.includes('Password1'));
    assert.deepEqual(errors, []);
  });
  console.log(`PASS: all ${passed} mentor page test groups; live requests, access and rendering.`);
} finally { globalThis.localStorage = previousStorage; console.error = originalError; await server.close(); }
