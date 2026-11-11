/*
  ThemeContext.jsx  (Owner: Dev 1)
  Keeps the current theme ('light' or 'dark') for the whole app and remembers it in
  localStorage under 'waqtuk.theme'. AppShell and AuthLayout read themeClass from useTheme()
  and put it on their root element. Nobody else defines colors or dark mode.
*/

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // The function runs only once, on the first render: read the saved theme
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('waqtuk.theme') || 'light';
  });

  // Save the theme every time it changes
  useEffect(() => {
    localStorage.setItem('waqtuk.theme', theme);
  }, [theme]);

  // Use the previous value so two quick clicks never get lost
  const toggleTheme = () => {
    setTheme(t => (t === 'light' ? 'dark' : 'light'));
  };

  // AppShell and AuthLayout put this string on their root element
  const themeClass = theme === 'dark' ? 'wq-shell wq-dark' : 'wq-shell';

  const value = { theme, setTheme, toggleTheme, themeClass };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
