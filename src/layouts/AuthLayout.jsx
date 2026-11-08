// Phase 0 placeholder. Owner: Dev 2.
import { Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './AuthLayout.css';
export default function AuthLayout({ children }) {
  const { themeClass } = useTheme();
  return <div className={themeClass}>{children ?? <Outlet />}</div>;
}
