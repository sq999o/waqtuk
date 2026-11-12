// AuthLayout: the frame of the Log in page (brand and theme toggle at the top, page below). Owner: Dev 2.
import { Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Icon } from '../components/ui';
import './AuthLayout.css';

export default function AuthLayout({ children }) {
  const { theme, toggleTheme, themeClass } = useTheme();
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  return (
    <div className={`${themeClass} wq-authlayout`}>
      <header className="wq-authlayout-top">
        <div className="wq-authlayout-brand">
          <span className="wq-authlayout-logo"><Icon name="clock" size={18} /></span>
          <span className="wq-authlayout-name">Waqtuk</span>
        </div>
        <button type="button" className="wq-authlayout-theme" onClick={toggleTheme} aria-label={`Switch to ${nextTheme} mode`}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>
      </header>
      {children ?? <Outlet />}
    </div>
  );
}
