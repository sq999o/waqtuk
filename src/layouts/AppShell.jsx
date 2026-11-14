import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './AppShell.css';

const SIDEBAR_STORAGE_KEY = 'waqtuk.sidebar';
const MOBILE_QUERY = '(max-width: 820px)';

// Read the saved desktop choice. Falls back to "open" if storage fails.
function readCollapsed() {
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'collapsed';
  } catch {
    return false;
  }
}

function readIsMobile() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(MOBILE_QUERY).matches;
}

export default function AppShell() {
  const { themeClass } = useTheme();
  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(readIsMobile);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const previousPathRef = useRef(location.pathname);
  const menuButtonRef = useRef(null);
  const drawerRef = useRef(null);

  function closeDrawer() {
    setDrawerOpen(false);
  }

  function toggleDrawer() {
    setDrawerOpen((previous) => !previous);
  }

  // Under 820 px the button opens the drawer.
  // Above 820 px it collapses or restores the sidebar.
  function handleMenuClick() {
    if (isMobile) {
      toggleDrawer();
    } else {
      setCollapsed((previous) => !previous);
    }
  }

  // Follow the 820 px breakpoint, and close the drawer on desktop.
  useEffect(() => {
    if (!window.matchMedia) return undefined;

    const query = window.matchMedia(MOBILE_QUERY);

    function handleChange(event) {
      setIsMobile(event.matches);
      if (!event.matches) setDrawerOpen(false);
    }

    setIsMobile(query.matches);
    query.addEventListener('change', handleChange);

    return () => {
      query.removeEventListener('change', handleChange);
    };
  }, []);

  // Remember the desktop choice after a reload.
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SIDEBAR_STORAGE_KEY,
        collapsed ? 'collapsed' : 'open'
      );
    } catch {
      // Storage can be blocked; the sidebar still works for this visit.
    }
  }, [collapsed]);

  // Close the mobile drawer when the route changes.
  useEffect(() => {
    if (
      previousPathRef.current !== location.pathname ||
      drawerOpen
    ) {
      previousPathRef.current = location.pathname;
      setDrawerOpen(false);
    }
  }, [location.pathname, location.hash]);

  // Scroll to the URL hash, or return to the top.
  useEffect(() => {
    const hash = location.hash;

    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return undefined;
    }

    let cancelled = false;
    let attempts = 0;
    let timeoutId;

    const maxAttempts = 10;
    const retryDelay = 100;

    function scrollToHash() {
      if (cancelled) return;

      let id;

      try {
        id = decodeURIComponent(hash.slice(1));
      } catch {
        id = hash.slice(1);
      }

      const target = document.getElementById(id);

      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        return;
      }

      attempts += 1;

      if (attempts < maxAttempts) {
        timeoutId = window.setTimeout(
          scrollToHash,
          retryDelay
        );
      }
    }

    // Let the destination page finish its initial render.
    timeoutId = window.setTimeout(scrollToHash, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [location.pathname, location.hash, location.key]);

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
    <div
      className={[
        themeClass,
        'wq-appshell',
        collapsed ? 'wq-appshell--collapsed' : '',
      ].filter(Boolean).join(' ')}
    >
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
        id="wq-appshell-navigation"
        ref={drawerRef}
        className={[
          'wq-appshell-sidebar',
          drawerOpen ? 'wq-appshell-sidebar--open' : '',
        ].filter(Boolean).join(' ')}
        aria-label="Main navigation"
        tabIndex={-1}
      >
        <Sidebar />
      </aside>

      <div className="wq-appshell-body">
        <Topbar
          onMenuClick={handleMenuClick}
          menuOpen={isMobile ? drawerOpen : !collapsed}
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