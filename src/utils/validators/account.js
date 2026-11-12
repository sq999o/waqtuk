// Prototype wording: design/reference.pdf pages 24, 32, 39 and 41.
// account* keys avoid collisions with the other owners' MESSAGES.
export const messages = {
  accountLoginRequired: 'Email and password are required.',
  accountInvalidCredentials: 'Invalid email or password.',
  accountSuspended: 'Your account is suspended. Contact an administrator.',
  accountRegistrationRequired: 'Name and a valid email are required.',
  accountEmailRegistered: 'This email is already registered.',
  accountPasswordShort: 'Password must be at least 8 characters.',
  accountPasswordMismatch: 'Passwords do not match.',
  accountCreated: 'Account created. You can log in now.',
  accountProfileRequired: 'Name and email are required.',
  accountNameRequired: 'Name is required.',
  accountInvalidEmail: 'Enter a valid email address.',
  accountEmailUsed: 'This email is already used by another account.',
  accountDuplicateEmail: 'Duplicate email: another account uses this email.',
  accountProfileUpdated: 'Profile updated.',
  accountDetailsSaved: 'Account details saved.',
  accountReasonRequired: 'Reason is required.',
  accountAlreadySuspended: 'Invalid status change: this account is already suspended.',
  // Sharing states: design/reference.pdf pages 30 and 34.
  sharingInvalidRange: 'Invalid request: end date must be on or after the start date.',
  sharingDuplicate: 'A pending or accepted request already exists for this mentor.',
  sharingUnavailable: 'This request is no longer available. It was cancelled or replaced by the student.',
  sharingSent: 'Request sent. Status: Pending.',
  // Defensive cases not illustrated in the prototype states.
  sharingDatesRequired: 'Enter valid start and end dates.',
  sharingMentorUnavailable: 'Choose an active academic mentor.',
  sharingInvalidSelection: 'Choose valid information and goals to share.',
  sharingInvalidGoals: 'Choose your own goals from the week of the start date.',
  sharingEmptySelection: 'Choose information or at least one goal to share.',
  accountAlreadyActive: 'Invalid status change: this account is already active.',
  accountInvalidStatus: 'Choose Active or Suspended.',
  accountInvalidRole: 'Choose Student or Academic Mentor.',
  accountNotAllowed: 'You do not have permission to perform this action.',
  accountUnavailable: 'This account is no longer available.',
};

export function validateEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ? { ok: true } : { ok: false, error: messages.accountInvalidEmail };
}

export function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8
    ? { ok: true } : { ok: false, error: messages.accountPasswordShort };
}

export function validateRegistration(payload, { users }) {
  if (typeof payload?.name !== 'string' || !payload.name.trim() || !validateEmail(payload?.email).ok)
    return { ok: false, error: messages.accountRegistrationRequired };
  if (!['student', 'mentor'].includes(payload.role === undefined ? 'student' : payload.role))
    return { ok: false, error: messages.accountInvalidRole };
  const email = payload.email.trim().toLowerCase();
  if (users.some(user => user.email.trim().toLowerCase() === email))
    return { ok: false, error: messages.accountEmailRegistered };
  const passwordCheck = validatePassword(payload.password);
  if (!passwordCheck.ok) return passwordCheck;
  if (payload.password !== payload.confirmPassword)
    return { ok: false, error: messages.accountPasswordMismatch };
  return { ok: true };
}
