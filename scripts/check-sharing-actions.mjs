import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as A from '../src/context/actions/sharing.js';
import { setUserStatus } from '../src/context/actions/accounts.js';
import { getSharedData, sharedStudents } from '../src/context/selectors/accounts.js';
import { messages as M } from '../src/utils/validators/account.js';

function freeze(value) { Object.freeze(value); Object.values(value).forEach(v => { if (v && typeof v === 'object') freeze(v); }); return value; }
const users = JSON.parse(readFileSync(new URL('../src/data/users.json', import.meta.url)));
const data = freeze({ users, sharingRequests: [], goals: [
  { id: 'own', studentId: 's1', weekStart: '2026-11-02', categoryId: 'study', targetMinutes: 600, direction: 'atLeast' },
  { id: 'other', studentId: 's2', weekStart: '2026-11-02', categoryId: 'study' },
  { id: 'old', studentId: 's1', weekStart: '2026-10-26', categoryId: 'study' },
], activities: [{ id: 'activity', studentId: 's1', categoryId: 'study', start: '2026-11-07T09:00', end: '2026-11-07T10:00', notes: 'Private' }] });
const ctx = id => ({ currentUser: users.find(user => user.id === id) });
const payload = freeze({ mentorId: 'm1', from: '2026-11-02', to: '2026-11-08', scope: ['summary', 'reports'], goalIds: ['own'] });
const send = (changes = {}, source = data, context = ctx('s1')) => A.sendRequest(source, { ...payload, ...changes }, context);
function failure(out, error, source = data) { assert.equal(out.data, source); assert.deepEqual(out.result, { ok: false, error }); }
let passed = 0;
function test(name, run) { run(); passed++; console.log(`PASS: ${name}`); }
const pending = freeze(send());
const id = pending.result.request.id;
const accepted = freeze(A.acceptRequest(pending.data, id, ctx('m1')));

test('prototype sharing messages are exact', () => {
  assert.equal(M.sharingInvalidRange, 'Invalid request: end date must be on or after the start date.');
  assert.equal(M.sharingDuplicate, 'A pending or accepted request already exists for this mentor.');
  assert.equal(M.sharingUnavailable, 'This request is no longer available. It was cancelled or replaced by the student.');
  assert.equal(M.sharingSent, 'Request sent. Status: Pending.');
});
test('sending uses live student identity and ignores injected fields', () => {
  const out = send({ id: 'admin', studentId: 's2', status: 'accepted', decidedOn: '2020-01-01', extra: true });
  assert.equal(out.result.ok, true);
  assert.deepEqual(out.result.request, { ...payload, id: out.result.request.id, studentId: 's1', status: 'pending' });
  assert.equal(out.data.sharingRequests.length, 1);
  for (const key of ['users', 'goals', 'activities']) assert.equal(out.data[key], data[key]);
  for (const context of [{}, ctx('missing'), ctx('m1'), ctx('a1'), ctx('s5'), { currentUser: { id: 'm1', role: 'student' } }])
    failure(send({}, data, context), M.accountNotAllowed);
  const suspended = { ...data, users: users.map(u => u.id === 's1' ? { ...u, status: 'suspended' } : u) };
  failure(send({}, suspended), M.accountNotAllowed, suspended);
});
test('only existing active mentors can receive requests', () => {
  for (const mentorId of [undefined, null, '', 'missing', 's1', 'a1']) failure(send({ mentorId }), M.sharingMentorUnavailable);
  const suspended = { ...data, users: users.map(u => u.id === 'm1' ? { ...u, status: 'suspended' } : u) };
  failure(send({}, suspended), M.sharingMentorUnavailable, suspended);
  for (const value of [null, undefined, {}, 12]) assert.equal(A.sendRequest(data, value, ctx('s1')).result.ok, false);
});
test('dates are required, real ISO calendar dates, inclusive and not reversed', () => {
  for (const bad of [undefined, null, '', 123, '2026-2-01', '2026-02-29', '2026-04-31', '2026-13-01', '2026-11-02T00:00']) {
    failure(send({ from: bad }), M.sharingDatesRequired); failure(send({ to: bad }), M.sharingDatesRequired);
  }
  failure(send({ from: '2026-11-08', to: '2026-11-02' }), M.sharingInvalidRange);
  for (const day of ['2024-02-29', '2026-03-08', '2026-11-02', '2027-01-01'])
    assert.equal(send({ from: day, to: day, goalIds: [] }).result.ok, true);
});
test('scope is explicit; goals must belong to this student and the start-date week', () => {
  for (const scope of [undefined, null, 'summary', ['private'], ['summary', null]]) failure(send({ scope }), M.sharingInvalidSelection);
  for (const goalIds of [undefined, null, 'own']) failure(send({ goalIds }), M.sharingInvalidSelection);
  for (const goalIds of [['missing'], ['other'], ['old'], [null]]) failure(send({ goalIds }), M.sharingInvalidGoals);
  failure(send({ scope: [], goalIds: [] }), M.sharingEmptySelection);
  assert.equal(send({ scope: [] }).result.ok, true);
  assert.equal(send({ goalIds: [] }).result.ok, true);
  assert.equal(send({ from: '2026-11-08' }).result.ok, true); // Sunday still belongs to Monday 2 Nov.
  failure(send({ from: '2026-11-09', to: '2026-11-15' }), M.sharingInvalidGoals);
  const out = send({ scope: ['summary', 'summary'], goalIds: ['own', 'own'] });
  assert.deepEqual(out.result.request.scope, ['summary']); assert.deepEqual(out.result.request.goalIds, ['own']);
  assert.notEqual(out.result.request.goalIds, payload.goalIds);
});
test('pending and accepted duplicates are blocked, including historical accepted ranges', () => {
  for (const source of [pending.data, accepted.data]) failure(send({}, source), M.sharingDuplicate, source);
  failure(send({ from: '2027-01-01', to: '2027-01-07', goalIds: [] }, accepted.data), M.sharingDuplicate, accepted.data);
  assert.equal(send({ mentorId: 'm2' }, pending.data).result.ok, true);
  assert.equal(send({ goalIds: [] }, pending.data, ctx('s2')).result.ok, true);
});
test('new IDs also avoid existing requests restored from storage', () => {
  const random = Math.random, values = [0.125, 0.25];
  const restoredId = `r-${(0.125).toString(36).slice(2, 8).padEnd(6, '0')}`;
  const source = { ...data, sharingRequests: [{ ...pending.result.request, id: restoredId, status: 'ended' }] };
  try {
    Math.random = () => { assert.ok(values.length, 'unexpected extra ID attempt'); return values.shift(); };
    const out = send({}, source);
    assert.equal(out.result.ok, true); assert.notEqual(out.result.request.id, restoredId);
    assert.equal(new Set(out.data.sharingRequests.map(r => r.id)).size, 2);
  } finally { Math.random = random; }
});
const transitions = [
  ['cancelRequest', 's1', 'pending', 'cancelled'], ['revokeAccess', 's1', 'accepted', 'revoked'],
  ['acceptRequest', 'm1', 'pending', 'accepted'], ['declineRequest', 'm1', 'pending', 'declined'],
  ['endSharing', 'm1', 'accepted', 'ended'],
];
test('every action permits only its documented transition and stamps the fixed TODAY', () => {
  for (const [action, actor, before, after] of transitions) {
    for (const status of ['pending', 'accepted', 'declined', 'cancelled', 'revoked', 'ended']) {
      const source = freeze({ ...data, sharingRequests: [{ ...pending.result.request, status }] });
      const out = A[action](source, id, ctx(actor));
      if (status !== before) { failure(out, M.sharingUnavailable, source); continue; }
      assert.deepEqual(out.result.request, { ...source.sharingRequests[0], status: after, decidedOn: '2026-11-07' });
      assert.equal(out.data.sharingRequests[0], out.result.request);
      assert.equal(out.data.users, source.users); assert.equal(out.data.goals, source.goals);
      failure(A[action](out.data, id, ctx(actor)), M.sharingUnavailable, out.data);
    }
  }
});
test('all transitions reject other owners, missing requests, stale roles and suspended actors', () => {
  for (const [action, actor, before] of transitions) {
    const source = before === 'pending' ? pending.data : accepted.data;
    const wrongOwner = actor === 's1' ? 's2' : 'm2', wrongRole = actor === 's1' ? 'm1' : 's1';
    failure(A[action](source, id, ctx(wrongOwner)), M.sharingUnavailable, source);
    failure(A[action](source, 'missing', ctx(actor)), M.sharingUnavailable, source);
    for (const context of [{}, ctx('a1'), ctx(wrongRole), { currentUser: { id: wrongRole, role: actor === 's1' ? 'student' : 'mentor' } }])
      failure(A[action](source, id, context), M.accountNotAllowed, source);
    const suspended = { ...source, users: users.map(u => u.id === actor ? { ...u, status: 'suspended' } : u) };
    failure(A[action](suspended, id, ctx(actor)), M.accountNotAllowed, suspended);
  }
});
test('acceptance rechecks live participants, selection and duplicate requests', () => {
  const sources = [
    { ...pending.data, users: users.filter(u => u.id !== 's1') },
    { ...pending.data, users: users.map(u => u.id === 's1' ? { ...u, status: 'suspended' } : u) },
    { ...pending.data, goals: [] },
    ...[{ scope: ['private'] }, { to: '2026-02-30' }, { goalIds: ['other'] }].map(changes =>
      ({ ...pending.data, sharingRequests: [{ ...pending.result.request, ...changes }] })),
    { ...pending.data, sharingRequests: [...pending.data.sharingRequests, { ...pending.result.request, id: 'duplicate' }] },
  ];
  for (const source of sources) failure(A.acceptRequest(source, id, ctx('m1')), M.sharingUnavailable, source);
});
test('cancellation and every terminal status allow a fresh pending request and retain history', () => {
  for (const status of ['cancelled', 'declined', 'revoked', 'ended']) {
    const source = freeze({ ...data, sharingRequests: [{ ...pending.result.request, status }] });
    const out = send({}, source);
    assert.equal(out.result.ok, true); assert.notEqual(out.result.request.id, id);
    assert.equal(out.data.sharingRequests.length, 2); assert.equal(out.data.sharingRequests[0], source.sharingRequests[0]);
    assert.equal(out.result.request.status, 'pending'); assert.equal(out.result.request.decidedOn, undefined);
    failure(A.acceptRequest(out.data, id, ctx('m1')), M.sharingUnavailable, out.data);
  }
});
test('access appears only after acceptance and disappears immediately on revoke or end', () => {
  assert.equal(getSharedData(pending.data, ctx('m1'))(id).student, undefined);
  assert.equal(sharedStudents(accepted.data, ctx('m1')).length, 1);
  const shared = getSharedData(accepted.data, ctx('m1'))(id);
  assert.equal(shared.student.name, 'Student A'); assert.equal(shared.student.password, undefined);
  assert.equal(shared.activities.length, 1); assert.equal(shared.activities[0].notes, undefined);
  for (const [action, actor] of [['revokeAccess', 's1'], ['endSharing', 'm1']]) {
    const ended = A[action](accepted.data, id, ctx(actor));
    assert.deepEqual(sharedStudents(ended.data, ctx('m1')), []);
    assert.equal(getSharedData(ended.data, ctx('m1'))(id).student, undefined);
    const next = send({}, ended.data);
    assert.equal(getSharedData(next.data, ctx('m1'))(next.result.request.id).student, undefined);
  }
});
test('suspension prevents stale acceptance and reactivation never restores consent', () => {
  for (const participant of ['s1', 'm1']) {
    const blocked = setUserStatus(pending.data, participant, 'suspended', 'Review', ctx('a1'));
    assert.equal(A.acceptRequest(blocked.data, id, ctx('m1')).result.ok, false);
    const restored = setUserStatus(blocked.data, participant, 'active', 'Resolved', ctx('a1'));
    failure(A.acceptRequest(restored.data, id, ctx('m1')), M.sharingUnavailable, restored.data);
    assert.deepEqual(sharedStudents(restored.data, ctx('m1')), []);
  }
});
console.log(`PASS: all ${passed} sharing action test groups; consent transitions, live authorization and no input mutation.`);
