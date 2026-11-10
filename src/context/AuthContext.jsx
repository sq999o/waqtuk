// Dev 4: DataContext owns users; AuthContext owns only the session identity.
import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { SESSION_KEY, EMPTY_SESSION, parseSession, sessionForUser, sameSession } from './authSession';
export { homeForRole } from './authSession';

const AuthContext = createContext(null);
function readSession() {
  try { return parseSession(localStorage.getItem(SESSION_KEY)); }
  catch { return EMPTY_SESSION; }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);
  useEffect(() => {
    try {
      if (session.userId && session.role) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    } catch { /* Blocked/full storage: keep the current in-memory session. */ }
  }, [session]);

  function signIn(userId) {
    // Call after a successful login/register action. Resolve the role from live data.
    if (typeof userId !== 'string' || !userId.trim()) return;
    setSession({ userId, role: null });
  }
  function signOut() { setSession(EMPTY_SESSION); }
  return <AuthContext.Provider value={{ session, setSession, signIn, signOut }}>
    {children}
  </AuthContext.Provider>;
}

// App supplies currentUser from useData(); DataContext's public API stays unchanged.
// Wait for reconciliation before showing a page or running its effects.
export function AuthSessionBoundary({ currentUser, children }) {
  const { session, setSession } = useContext(AuthContext);
  const next = sessionForUser(session.userId, currentUser);
  const ready = sameSession(session, next);
  useLayoutEffect(() => {
    if (!ready) setSession(next);
  }, [ready, next.userId, next.role, setSession]);
  return ready ? children : null;
}

export function useAuth() {
  const { session, signIn, signOut } = useContext(AuthContext);
  return { ...session, isAuthenticated: Boolean(session.userId && session.role), signIn, signOut };
}
