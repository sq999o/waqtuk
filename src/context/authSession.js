// Dev 4: session values contain identity only, never the full user/password.
export const SESSION_KEY = 'waqtuk.session';
export const EMPTY_SESSION = Object.freeze({ userId: null, role: null });

export function homeForRole(role) {
  if (role === 'student') return '/dashboard';
  if (role === 'mentor') return '/mentor';
  if (role === 'admin') return '/admin';
  return '/';
}

export function parseSession(text) {
  try {
    const saved = JSON.parse(text);
    if (typeof saved?.userId !== 'string' || !saved.userId.trim()
      || homeForRole(saved.role) === '/') return EMPTY_SESSION;
    return { userId: saved.userId, role: saved.role };
  } catch { return EMPTY_SESSION; }
}

export function sessionForUser(userId, user) {
  if (!userId || !user || user.id !== userId || user.status !== 'active'
    || homeForRole(user.role) === '/') return EMPTY_SESSION;
  return { userId, role: user.role };
}

export function sameSession(a, b) {
  return a.userId === b.userId && a.role === b.role;
}
