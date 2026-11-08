// Phase 0 placeholder. Owner: Dev 3.
import { Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './AppShell.css';
export default function AppShell() {
  const { themeClass } = useTheme();
  return <div className={themeClass}><Sidebar /><Topbar /><main><Outlet /></main></div>;
}
