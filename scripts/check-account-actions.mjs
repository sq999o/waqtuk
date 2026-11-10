import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as A from '../src/context/actions/accounts.js';
import { messages as M, validateEmail, validatePassword, validateRegistration } from '../src/utils/validators/account.js';

const users = JSON.parse(readFileSync(new URL('../src/data/users.json', import.meta.url)));
const request = (id, studentId, mentorId, status) => ({ id, studentId, mentorId, status, decidedOn: '2026-10-28', goalIds: ['g1'] });
const data = { users, activities: [{ id: 'untouched' }], sharingRequests: [
  request('pending', 's1', 'm1', 'pending'), request('accepted', 's1', 'm2', 'accepted'),
  request('other-mentor', 's2', 'm1', 'accepted'), request('unrelated', 's3', 'm3', 'accepted'),
  ...['declined', 'cancelled', 'revoked', 'ended'].map(status => request(status, 's1', 'm1', status)),
] };
function freeze(value) { Object.freeze(value); Object.values(value).forEach(item => { if (item && typeof item === 'object') freeze(item); }); return value; }
freeze(data); // Successful and failed actions must also work on immutable input.
const ctx = id => ({ currentUser: users.find(user => user.id === id) });
const payload = { name: ' New Student ', email: ' NEW@Example.com ', password: 'Password2', confirmPassword: 'Password2', role: 'student' };
let passed = 0;
function test(name, run) { run(); passed++; console.log(`PASS: ${name}`); }
function failure(out, message, original = data) {
  assert.equal(out.data, original);
  assert.deepEqual(out.result, { ok: false, error: message });
}
const reg = changes => A.register(data, { ...payload, ...changes }, {});

test('email/password validation and exact prototype messages', () => {
  for (const value of [undefined, null, 10, '', 'a', 'a@@b.com', 'a b@c.com', 'a@b']) assert.equal(validateEmail(value).ok, false);
  assert.deepEqual(validateEmail(' A+B@example.com '), { ok: true });
  for (const value of [undefined, null, 12345678, '', '1234567']) assert.deepEqual(validatePassword(value), { ok: false, error: M.accountPasswordShort });
  assert.deepEqual(validatePassword('12345678'), { ok: true });
  assert.equal(M.accountInvalidCredentials, 'Invalid email or password.');
  assert.equal(M.accountDuplicateEmail, 'Duplicate email: another account uses this email.');
});
test('registration rejects missing fields, duplicates, invalid roles and mismatched passwords', () => {
  for (const p of [undefined, null, {}, { ...payload, name: ' ' }, { ...payload, email: 'invalid' }])
    assert.deepEqual(validateRegistration(p, { users }), { ok: false, error: M.accountRegistrationRequired });
  failure(reg({ email: ' STUDENT@EXAMPLE.COM ' }), M.accountEmailRegistered);
  failure(reg({ email: 'student.e@example.com' }), M.accountEmailRegistered);
  for (const role of ['admin', 'superuser', '', null]) failure(reg({ role }), M.accountInvalidRole);
  failure(reg({ password: 'short' }), M.accountPasswordShort);
  failure(reg({ confirmPassword: 'different' }), M.accountPasswordMismatch);
  failure(reg({ confirmPassword: undefined }), M.accountPasswordMismatch);
});
test('student and mentor registration returns usable accounts with unique IDs', () => {
  const ids = new Set(users.map(user => user.id));
  for (const role of ['student', 'mentor', undefined]) {
    const out = reg({ role, id: 'a1', status: 'suspended', mentorName: 'Injected', extra: true });
    const user = out.result.user;
    assert.equal(out.result.ok, true); assert.equal(out.data.users.length, users.length + 1);
    assert.equal(user.name, 'New Student'); assert.equal(user.email, 'new@example.com');
    assert.equal(user.role, role ?? 'student'); assert.equal(user.status, 'active');
    assert.equal(user.mentorName, user.role === 'student' ? 'New Student' : undefined);
    assert.ok(!ids.has(user.id)); ids.add(user.id);
    assert.equal(user.confirmPassword, undefined); assert.equal(user.extra, undefined);
    assert.equal(out.data.sharingRequests, data.sharingRequests); assert.equal(out.data.activities, data.activities);
    assert.equal(A.login(out.data, user.email, 'Password2', {}).result.user, user);
    failure(A.register(out.data, payload, {}), M.accountEmailRegistered, out.data);
  }
});
test('login accepts all active seeds and rejects wrong, missing or suspended credentials', () => {
  for (const user of users.filter(user => user.status === 'active')) {
    const out = A.login(data, ` ${user.email.toUpperCase()} `, 'Password1', {});
    assert.equal(out.data, data); assert.equal(out.result.user, user); assert.equal(out.result.ok, true);
  }
  failure(A.login(data, '', 'Password1', {}), M.accountLoginRequired);
  failure(A.login(data, 'student@example.com', '', {}), M.accountLoginRequired);
  for (const email of ['unknown@example.com', 'invalid', 'student@example.com', 'student.e@example.com'])
    failure(A.login(data, email, 'wrong', {}), M.accountInvalidCredentials);
  failure(A.login(data, 'student.e@example.com', 'Password1', {}), M.accountSuspended);
  failure(A.login(data, 'student@example.com', ' Password1 ', {}), M.accountInvalidCredentials);
});
test('profile edits preserve identity, role, password, status and mentor alias', () => {
  const out = A.updateProfile(data, { name: ' Renamed ', email: ' RENAMED@EXAMPLE.COM ', id: 'a1', role: 'admin', password: 'hacked', status: 'suspended', mentorName: 'hacked' }, ctx('s1'));
  assert.deepEqual(out.result.user, { ...users[0], name: 'Renamed', email: 'renamed@example.com' });
  assert.equal(out.data.users[1], users[1]); assert.equal(out.data.sharingRequests, data.sharingRequests);
  assert.equal(A.updateProfile(data, { name: 'Name only' }, ctx('s1')).result.user.email, users[0].email);
  assert.equal(A.updateProfile(data, { email: ' STUDENT@EXAMPLE.COM ' }, ctx('s1')).result.ok, true);
  failure(A.login(out.data, users[0].email, 'Password1', {}), M.accountInvalidCredentials, out.data);
  assert.equal(A.login(out.data, 'renamed@example.com', 'Password1', {}).result.ok, true);
});
test('student and mentor profile errors match their own design states', () => {
  failure(A.updateProfile(data, { name: '' }, ctx('s1')), M.accountProfileRequired);
  failure(A.updateProfile(data, { email: '' }, ctx('s1')), M.accountProfileRequired);
  failure(A.updateProfile(data, { email: 'bad' }, ctx('s1')), M.accountInvalidEmail);
  failure(A.updateProfile(data, { email: ' MENTOR@EXAMPLE.COM ' }, ctx('s1')), M.accountEmailUsed);
  failure(A.updateProfile(data, { name: '' }, ctx('m1')), M.accountNameRequired);
  failure(A.updateProfile(data, { email: '' }, ctx('m1')), M.accountInvalidEmail);
  failure(A.updateProfile(data, { email: 'student@example.com' }, ctx('m1')), M.accountDuplicateEmail);
  for (const id of [undefined, 'missing', 's5']) failure(A.updateProfile(data, { name: 'Changed' }, ctx(id)), M.accountNotAllowed);
});
test('admin edits validate details and cannot edit protected fields or admin accounts', () => {
  for (const id of ['s1', 'm1', 's5']) {
    const before = users.find(user => user.id === id);
    const out = A.updateUser(data, id, { name: ' Edited ', role: 'admin', password: 'hacked', status: 'suspended', id: 'x' }, ctx('a1'));
    assert.deepEqual(out.result.user, { ...before, name: 'Edited' });
  }
  failure(A.updateUser(data, 's1', { email: 'bad' }, ctx('a1')), M.accountInvalidEmail);
  failure(A.updateUser(data, 's1', { email: ' MENTOR@EXAMPLE.COM ' }, ctx('a1')), M.accountDuplicateEmail);
  failure(A.updateUser(data, 'missing', {}, ctx('a1')), M.accountUnavailable);
  failure(A.updateUser(data, 'a1', {}, ctx('a1')), M.accountNotAllowed);
});
test('only a current active admin can edit or suspend another account', () => {
  for (const context of [{}, ctx('s1'), ctx('m1'), ctx('s5'), { currentUser: { id: 's1', role: 'admin' } }]) {
    failure(A.updateUser(data, 's2', { name: 'Changed' }, context), M.accountNotAllowed);
    failure(A.setUserStatus(data, 's2', 'suspended', 'Reason', context), M.accountNotAllowed);
  }
  const suspendedAdmin = { ...data, users: users.map(user => user.id === 'a1' ? { ...user, status: 'suspended' } : user) };
  failure(A.setUserStatus(suspendedAdmin, 's1', 'suspended', 'Reason', ctx('a1')), M.accountNotAllowed, suspendedAdmin);
});
test('status changes require a valid target, new status and reason', () => {
  failure(A.setUserStatus(data, 'missing', 'suspended', 'Reason', ctx('a1')), M.accountUnavailable);
  failure(A.setUserStatus(data, 'a1', 'suspended', 'Reason', ctx('a1')), M.accountNotAllowed);
  failure(A.setUserStatus(data, 's1', 'invalid', 'Reason', ctx('a1')), M.accountInvalidStatus);
  failure(A.setUserStatus(data, 's1', 'active', 'Reason', ctx('a1')), M.accountAlreadyActive);
  failure(A.setUserStatus(data, 's5', 'suspended', 'Reason', ctx('a1')), M.accountAlreadySuspended);
  for (const reason of ['', '  ', null, undefined, 12]) failure(A.setUserStatus(data, 's1', 'suspended', reason, ctx('a1')), M.accountReasonRequired);
  failure(A.setUserStatus(data, 's5', 'active', '', ctx('a1')), M.accountReasonRequired);
});
test('student and mentor suspension cancels pending and revokes accepted requests only', () => {
  for (const id of ['s1', 'm1']) {
    const out = A.setUserStatus(data, id, 'suspended', ' Review requested ', ctx('a1'));
    assert.equal(out.result.user.status, 'suspended'); assert.equal(out.result.user.statusReason, 'Review requested');
    for (const before of data.sharingRequests) {
      const after = out.data.sharingRequests.find(item => item.id === before.id);
      if ((before.studentId === id || before.mentorId === id) && ['pending', 'accepted'].includes(before.status)) {
        assert.deepEqual(after, { ...before, status: before.status === 'pending' ? 'cancelled' : 'revoked', decidedOn: '2026-11-07' });
      } else assert.equal(after, before);
    }
    failure(A.login(out.data, out.result.user.email, 'Password1', {}), M.accountSuspended, out.data);
    failure(A.updateProfile(out.data, { name: 'Cannot edit' }, ctx(id)), M.accountNotAllowed, out.data);
    const restored = A.setUserStatus(out.data, id, 'active', 'Resolved', ctx('a1'));
    assert.equal(A.login(restored.data, restored.result.user.email, 'Password1', {}).result.ok, true);
    assert.equal(restored.data.sharingRequests, out.data.sharingRequests);
    assert.equal(restored.data.activities, data.activities);
  }
});
console.log(`PASS: all ${passed} account action test groups; no input mutation.`);
