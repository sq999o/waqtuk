import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { EMPTY_SESSION, homeForRole, parseSession, sessionForUser, sameSession } from '../src/context/authSession.js';

const student = { id: 's1', role: 'student', status: 'active' };
assert.deepEqual(sessionForUser('s1', student), { userId: 's1', role: 'student' });
for (const user of [undefined, { ...student, id: 's2' }, { ...student, status: 'suspended' }, { ...student, role: 'owner' }]) {
  assert.deepEqual(sessionForUser('s1', user), EMPTY_SESSION);
}
// Newly created users must work without being present in users.json.
assert.deepEqual(sessionForUser('new-user', { id: 'new-user', role: 'mentor', status: 'active' }), { userId: 'new-user', role: 'mentor' });
for (const text of [null, '', 'broken', 'null', '[]', '{}', '{"userId":"","role":"admin"}', '{"userId":4,"role":"admin"}', '{"userId":"s1","role":"owner"}']) {
  assert.deepEqual(parseSession(text), EMPTY_SESSION);
}
const restored = parseSession(JSON.stringify({ userId: 's1', role: 'student', password: 'must-not-persist', name: 'Extra' }));
assert.deepEqual(restored, { userId: 's1', role: 'student' });
assert.deepEqual(sessionForUser(restored.userId, { ...student, role: 'mentor' }), { userId: 's1', role: 'mentor' });
assert.ok(sameSession(restored, { userId: 's1', role: 'student' }));
assert.ok(!sameSession(restored, EMPTY_SESSION));
assert.deepEqual(['student', 'mentor', 'admin', '__proto__', null].map(homeForRole), ['/dashboard', '/mentor', '/admin', '/', '/']);

const users = JSON.parse(await readFile(new URL('../src/data/users.json', import.meta.url), 'utf8'));
assert.equal(users.length, 10);
assert.equal(new Set(users.map(user => user.id)).size, 10);
assert.equal(new Set(users.map(user => user.email)).size, 10);
assert.equal(users.filter(user => user.role === 'student').length, 6);
assert.equal(users.filter(user => user.role === 'mentor').length, 3);
assert.equal(users.filter(user => user.role === 'admin').length, 1);
assert.deepEqual(users.filter(user => user.status === 'suspended').map(user => user.id), ['s5']);
assert.ok(users.every(user => user.password === 'Password1'));
for (const user of users) {
  const session = sessionForUser(user.id, user);
  assert.equal(Boolean(session.userId), user.status === 'active');
  assert.deepEqual(Object.keys(session).sort(), ['role', 'userId']);
}
console.log('PASS: auth session rules, invalid storage, active/new/suspended users, role resolution, identity-only session and all 10 seed users.');
