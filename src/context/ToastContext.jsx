// Phase 0 no-op placeholder. Owner: Dev 1.
import { createContext, useContext } from 'react';
const ToastContext = createContext(null);
export function ToastProvider({ children }) {
  return <ToastContext.Provider value={{ show: (message, tone = 'success') => {} }}>{children}</ToastContext.Provider>;
}
export function useToast() { return useContext(ToastContext); }
