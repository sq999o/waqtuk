// Phase 0 placeholder. Owner: Dev 1. Persistence and final tokens come in Phase 1.
import { createContext, useContext, useState } from 'react';
const ThemeContext = createContext(null);
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  return <ThemeContext.Provider value={{ theme, setTheme,
    toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light'),
    themeClass: theme === 'dark' ? 'wq-shell wq-dark' : 'wq-shell',
  }}>{children}</ThemeContext.Provider>;
}
export function useTheme() { return useContext(ThemeContext); }
