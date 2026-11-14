
/*
  ToastContext.jsx  (Owner: Dev 1)
  Shows one small message ("toast") at a time. Any page calls useToast().show('Activity saved.')
  after an action, and the message disappears by itself after 3000 ms.
  Contract (agreements 5.2): useToast() returns { show(message, tone = 'success') },
  tone is 'success' | 'error' | 'info'.
*/

import { createContext, useContext, useState, useEffect } from 'react';
import { Toast } from '../components/ui';
import { useTheme } from './ThemeContext';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const { themeClass } = useTheme();
  // One toast object { message, tone }, or null when nothing is shown
  const [toast, setToast] = useState(null);

  // A new toast replaces the old one, so only one is visible at a time
  const show = (message, tone = 'success') => {
    setToast({ message, tone });
  };

  // Hide the toast 3000 ms after the last show()
  useEffect(() => {
    if (!toast) return;

    const id = setTimeout(() => {
      setToast(null);
    }, 3000);

    // Cancel the old timer when a newer toast arrives, so it gets its own 3 seconds
    return () => clearTimeout(id);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {/* This sibling of App must receive its own scoped theme tokens. */}
      {toast && <Toast className={themeClass} message={toast.message} tone={toast.tone} />}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

