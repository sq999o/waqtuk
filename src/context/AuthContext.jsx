// Owner: Dev 4. Phase 0 session/route scaffold, not the Phase 1 account feature.
import { createContext, useContext, useState } from 'react';
import usersSeed from '../data/users.json';
import { previewUsers } from '../dev/previewUsers';

const AuthContext = createContext(null);
const SESSION_KEY = 'waqtuk.session';
const emptySession = { userId: null, role: null };
export function homeForRole(role) {
  return { student: '/dashboard', mentor: '/mentor', admin: '/admin' }[role] || '/';
}
function readSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(SESSION_KEY));
    return saved && typeof saved.userId === 'string' && homeForRole(saved.role) !== '/'
      ? { userId: saved.userId, role: saved.role } : emptySession;
  } catch { return emptySession; }
}
export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);
  function signIn(userId) {
    // Phase 1 must finish registration/login; pages must call login before signIn.
    // Phase 0 resolves seed/preview users only. Finish new-account lookup in Phase 1.
    let users = usersSeed;
    if (import.meta.env.DEV && users.length === 0) users = previewUsers;
    const user = users.find(item => item.id === userId && item.status === 'active');
    if (!user || homeForRole(user.role) === '/') return;
    const next = { userId: user.id, role: user.role };
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(next)); } catch { /* In-memory session still works. */ }
    setSession(next);
  }
  function signOut() {
    try { localStorage.removeItem(SESSION_KEY); } catch { /* In-memory sign-out still works. */ }
    setSession(emptySession);
  }
  return <AuthContext.Provider value={{ ...session, isAuthenticated: Boolean(session.userId), signIn, signOut }}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
