
import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './AppShell.css';

export default function AppShell() {
  const { themeClass } = useTheme();
  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const previousPathRef = useRef(location.pathname);
  const menuButtonRef = useRef(null);
  const drawerRef = useRef(null);

  function closeDrawer() {
    setDrawerOpen(false);
  }

  function toggleDrawer() {
    setDrawerOpen((previous) => !previous);
  }

  // Close the mobile drawer when the route changes.
  useEffect(() => {
    if (previousPathRef.current !== location.pathname) {
      previousPathRef.current = location.pathname;
      setDrawerOpen(false);
    }
  }, [location.pathname]);

  // Escape closes the drawer.
  useEffect(() => {
    if (!drawerOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDrawer();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawerOpen]);

  // Prevent scrolling behind the open drawer.
  useEffect(() => {
    if (!drawerOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen]);

  // Move focus into the drawer when it opens.
  useEffect(() => {
    if (!drawerOpen) return undefined;

    const drawer = drawerRef.current;
    const previousFocus = document.activeElement;

    const firstLink = drawer?.querySelector(
      'a[href], button:not([disabled])'
    );

    if (firstLink) {
      firstLink.focus();
    } else {
      drawer?.focus();
    }

    return () => {
      if (previousFocus?.isConnected) {
        previousFocus.focus();
      }
    };
  }, [drawerOpen]);

  return (
    <div className={`${themeClass} wq-appshell`}>
      {drawerOpen && (
        <button
          type="button"
          className="wq-appshell-backdrop"
          aria-label="Close navigation menu"
          onClick={closeDrawer}
          tabIndex={-1}
        />
      )}

      <aside
        ref={drawerRef}
        className={[
          'wq-appshell-sidebar',
          drawerOpen ? 'wq-appshell-sidebar--open' : ''
        ].filter(Boolean).join(' ')}
        aria-label="Main navigation"
        tabIndex={-1}
      >
        <Sidebar />
      </aside>

      <div className="wq-appshell-body">
        <Topbar
          onMenuClick={toggleDrawer}
          menuOpen={drawerOpen}
          menuButtonRef={menuButtonRef}
        />

        <main
          className="wq-appshell-main wq-main-pad"
          id="wq-main-content"
        >
          <div className="wq-appshell-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
