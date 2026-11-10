import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as S from '../src/context/selectors/accounts.js';
import { setUserStatus } from '../src/context/actions/accounts.js';

const seed = name => JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url)));
const userSeed = seed('users'), usage = seed('usage');
const goal = (id, studentId, weekStart, categoryId = 'study') => ({ id, studentId, weekStart, categoryId, targetMinutes: 600, direction: 'atLeast', privateNote: 'PRIVATE GOAL' });
const activity = (id, start, end, studentId = 's1', categoryId = 'study') => ({ id, start, end, studentId, categoryId, notes: 'PRIVATE ACTIVITY', secret: 'PRIVATE EXTRA' });
const request = (id, changes = {}) => ({ id, studentId: 's1', mentorId: 'm1', from: '2026-11-02', to: '2026-11-08', scope: ['summary', 'reports'], goalIds: ['g1', 'g-other', 'g-old', 'missing'], status: 'accepted', ...changes });
const data = {
  users: userSeed, usage,
  goals: [goal('g1', 's1', '2026-11-02'), goal('g-unselected', 's1', '2026-11-02'),
    goal('g-other', 's2', '2026-11-02'), goal('g-old', 's1', '2026-10-26'), goal('g-future', 's1', '2026-11-09')],
  activities: [
    activity('first', '2026-11-02T00:00', '2026-11-02T00:30'),
    activity('last-overnight', '2026-11-08T23:00', '2026-11-09T02:00'),
    activity('starts-before', '2026-11-01T23:00', '2026-11-02T02:00'),
    activity('after', '2026-11-09T00:00', '2026-11-09T01:00'),
    activity('other-student', '2026-11-03T10:00', '2026-11-03T11:00', 's2'),
    activity('work', '2026-11-04T10:00', '2026-11-04T11:00', 's1', 'work'),
    activity('reversed', '2026-11-03T11:00', '2026-11-03T10:00'),
    activity('invalid-date', '2026-11-31T10:00', '2026-12-01T11:00'),
  ],
  sharingRequests: [request('accepted'), request('other-mentor', { mentorId: 'm2' }),
    request('other-student', { studentId: 's2', goalIds: ['g-other'] }),
    request('suspended-student', { studentId: 's5' }),
    request('missing-student', { studentId: 'deleted' }),
    request('historical', { from: '2026-10-26', to: '2026-11-01', goalIds: ['g-old'] }),
    ...['pending', 'declined', 'cancelled', 'revoked', 'ended'].map(status => request(status, { status }))],
};
function freeze(value) { Object.freeze(value); Object.values(value).forEach(item => { if (item && typeof item === 'object') freeze(item); }); return value; }
freeze(data);
const ctx = id => ({ currentUser: userSeed.find(user => user.id === id) });
const empty = { student: undefined, activities: [], goals: [] };
const zeroUsage = { students: 0, mentors: 0, activities: 0, requests: 0, reports: 0 };
const shared = (id, context = ctx('m1'), source = data) => S.getSharedData(source, context)(id);
const ids = rows => rows.map(row => row.id);
const withRequest = changes => ({ ...data, sharingRequests: [request('test', changes)] });
let passed = 0;
function test(name, run) { run(); passed++; console.log(`PASS: ${name}`); }

test('accepted access includes both boundary dates and assigns overnight activity to its start date', () => {
  const out = shared('accepted');
  assert.deepEqual(ids(out.activities), ['first', 'last-overnight', 'work']);
  assert.equal(out.activities[1].end, '2026-11-09T02:00');
  assert.deepEqual(ids(out.goals), ['g1']);
  assert.equal(out.student.id, 's1');
});
test('pending, terminal, missing, wrong-role and wrong-mentor requests deny private data', () => {
  for (const id of ['pending', 'declined', 'cancelled', 'revoked', 'ended', 'missing', 'other-mentor', 'suspended-student', 'missing-student'])
    assert.deepEqual(shared(id), empty, id);
  for (const context of [{}, ctx('s1'), ctx('a1'), ctx('s5'), { currentUser: { id: 'deleted', role: 'mentor' } }, { currentUser: { id: 's1', role: 'mentor' } }])
    assert.deepEqual(shared('accepted', context), empty);
  assert.equal(shared('other-mentor', ctx('m2')).student.id, 's1');
});
test('missing/suspended participants are rejected using live records, not stale ctx roles/status', () => {
  for (const id of ['s1', 'm1']) {
    const suspended = { ...data, users: data.users.map(user => user.id === id ? { ...user, status: 'suspended' } : user) };
    assert.deepEqual(shared('accepted', ctx('m1'), suspended), empty);
    assert.ok(!S.sharedStudents(suspended, ctx('m1')).some(row => row.request.id === 'accepted'));
    const deleted = { ...data, users: data.users.filter(user => user.id !== id) };
    assert.deepEqual(shared('accepted', ctx('m1'), deleted), empty);
  }
});
test('mentor projections hide real name, password and private notes without mutating the source', () => {
  const out = shared('accepted');
  assert.equal(out.student.name, 'Student A'); assert.equal(out.student.mentorName, 'Student A');
  assert.equal(out.student.password, undefined); assert.equal(out.student.name === data.users[0].name, false);
  assert.deepEqual(Object.keys(out.activities[0]).sort(), ['categoryId', 'end', 'id', 'start', 'studentId']);
  assert.equal(out.goals[0].privateNote, undefined);
  assert.ok(!JSON.stringify(out).includes('PRIVATE')); assert.ok(!JSON.stringify(out).includes('Password1'));
  out.student.name = 'Changed'; out.activities[0].start = 'Changed'; out.goals[0].weekStart = 'Changed';
  assert.equal(data.users[0].mentorName, 'Student A'); assert.equal(data.activities[0].start, '2026-11-02T00:00');
  assert.equal(data.goals[0].weekStart, '2026-11-02');
});
test('history stays readable after TODAY when the request is still accepted', () => {
  const out = shared('historical');
  assert.equal(out.student.id, 's1'); assert.deepEqual(ids(out.goals), ['g-old']);
  assert.deepEqual(ids(out.activities), ['starts-before']);
});
test('selected goals must belong to the student and overlap the approved range', () => {
  const source = withRequest({ from: '2026-11-04', to: '2026-11-04', goalIds: ['g1', 'g-other', 'g-old', 'g-future', 'missing'] });
  const out = shared('test', ctx('m1'), source);
  assert.deepEqual(ids(out.goals), ['g1']); assert.deepEqual(ids(out.activities), ['work']);
  const copied = S.sharedStudents(source, ctx('m1'))[0].request;
  assert.deepEqual(copied.goalIds, ['g1']); copied.scope.push('changed'); copied.goalIds.push('changed');
  assert.equal(source.sharingRequests[0].scope.length, 2); assert.equal(source.sharingRequests[0].goalIds.length, 5);
});
test('summary/report scopes and goals-only access return only the allowed activity categories/weeks', () => {
  for (const scope of [['summary'], ['reports']]) {
    const source = withRequest({ scope, goalIds: [] });
    assert.deepEqual(ids(shared('test', ctx('m1'), source).activities), ['first', 'last-overnight', 'work']);
    assert.deepEqual(shared('test', ctx('m1'), source).goals, []);
    assert.deepEqual(S.sharedStudents(source, ctx('m1'))[0].request.scope, scope);
  }
  const goalsOnly = withRequest({ scope: [], goalIds: ['g1'], to: '2026-11-15' });
  assert.deepEqual(ids(shared('test', ctx('m1'), goalsOnly).activities), ['first', 'last-overnight']);
  const none = shared('test', ctx('m1'), withRequest({ scope: [], goalIds: [] }));
  assert.deepEqual(none.activities, []); assert.deepEqual(none.goals, []);
});
test('invalid dates, reversed ranges and malformed scopes do not grant access', () => {
  for (const changes of [{ from: '2026-02-30' }, { to: '2026-11-01' }, { from: '' }, { to: null },
    { from: '2026-1-02' }, { scope: undefined }, { scope: 'reports' }, { scope: ['private'] }, { goalIds: null }]) {
    const source = withRequest(changes);
    assert.deepEqual(shared('test', ctx('m1'), source), empty);
    assert.deepEqual(S.sharedStudents(source, ctx('m1')), []);
  }
});
test('request lists are role/owner-specific and sharedStudents contains only accessible accepted requests', () => {
  assert.deepEqual(S.myRequests(data, ctx('s1')), data.sharingRequests.filter(row => row.studentId === 's1'));
  assert.deepEqual(S.mentorRequests(data, ctx('m1')), data.sharingRequests.filter(row => row.mentorId === 'm1'));
  assert.deepEqual(S.myRequests(data, ctx('m1')), []); assert.deepEqual(S.mentorRequests(data, ctx('s1')), []);
  assert.deepEqual(S.myRequests(data, {}), []); assert.deepEqual(S.mentorRequests(data, ctx('a1')), []);
  assert.deepEqual(S.sharedStudents(data, ctx('m1')).map(row => row.request.id), ['accepted', 'other-student', 'historical']);
  assert.ok(S.sharedStudents(data, ctx('m1')).every(row => row.student.password === undefined));
  assert.deepEqual(S.sharedStudents(data, ctx('a1')), []);
  assert.equal(S.getUser(data, {} )('m1'), data.users.find(user => user.id === 'm1'));
  assert.equal(S.getUser(data, {} )('missing'), undefined);
});
test('suspension cascade immediately removes access and reactivation does not restore it', () => {
  for (const id of ['s1', 'm1']) {
    const suspended = setUserStatus(data, id, 'suspended', 'Review', ctx('a1'));
    assert.equal(suspended.result.ok, true);
    assert.deepEqual(shared('accepted', ctx('m1'), suspended.data), empty);
    const restored = setUserStatus(suspended.data, id, 'active', 'Resolved', ctx('a1'));
    assert.equal(restored.result.ok, true);
    assert.deepEqual(shared('accepted', ctx('m1'), restored.data), empty);
  }
});
test('admin usage uses the agreed seven-day base and inclusive rounded scaling', () => {
  assert.deepEqual(usage, { students: 14, mentors: 3, activities: 412, requests: 27, reports: 5 });
  const totals = S.usageFor(data, ctx('a1'));
  assert.deepEqual(totals('2026-11-02', '2026-11-08'), usage);
  assert.deepEqual(totals('2026-11-07', '2026-11-07'), { students: 2, mentors: 0, activities: 59, requests: 4, reports: 1 });
  for (const [from, to, days] of [['2026-10-26', '2026-11-08', 14], ['2024-02-28', '2024-03-01', 3], ['2026-03-07', '2026-03-09', 3], ['2025-12-31', '2026-01-01', 2]])
    assert.deepEqual(totals(from, to), Object.fromEntries(Object.entries(usage).map(([key, count]) => [key, Math.round(count * days / 7)])));
});
test('usage denies non-admins and returns zero for invalid ranges or missing counts', () => {
  for (const context of [{}, ctx('s1'), ctx('m1'), { currentUser: { id: 's1', role: 'admin' } }])
    assert.deepEqual(S.usageFor(data, context)('2026-11-02', '2026-11-08'), zeroUsage);
  const suspended = { ...data, users: data.users.map(user => user.id === 'a1' ? { ...user, status: 'suspended' } : user) };
  assert.deepEqual(S.usageFor(suspended, ctx('a1'))('2026-11-02', '2026-11-08'), zeroUsage);
  for (const [from, to] of [['2026-11-08', '2026-11-02'], ['2026-02-29', '2026-03-01'], ['', ''], [undefined, null]])
    assert.deepEqual(S.usageFor(data, ctx('a1'))(from, to), zeroUsage);
  const malformed = { ...data, usage: { students: NaN, mentors: -1, activities: Infinity, requests: '27' } };
  assert.deepEqual(S.usageFor(malformed, ctx('a1'))('2026-11-02', '2026-11-08'), zeroUsage);
});
console.log(`PASS: all ${passed} shared access and usage test groups; private data filtered; no input mutation.`);
