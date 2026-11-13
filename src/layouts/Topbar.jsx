
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { Icon } from '../components/ui';
import { TODAY } from '../utils/time';
import './Topbar.css';

const BREADCRUMBS = {
  student: {
    '/dashboard': ['Overview', 'Dashboard'],
    '/activities': ['Overview', 'Activities'],
    '/calendar': ['Overview', 'Calendar'],
    '/reports': ['Overview', 'Reports'],
    '/goals': ['Planning', 'Goals'],
    '/categories': ['Planning', 'Categories'],
    '/sharing': ['Mentor', 'Sharing'],
    '/feedback': ['Mentor', 'Mentor Feedback'],
    '/profile': ['Account', 'Profile'],
  },
  mentor: {
    '/mentor': ['Menu', 'Home'],
    '/mentor/requests': ['Menu', 'Sharing Requests'],
    '/mentor/students': ['Menu', 'Shared Students'],
    '/mentor/announcements': ['Menu', 'Announcements'],
    '/mentor/profile': ['Account', 'Profile'],
  },
  admin: {
    '/admin': ['Administration', 'Dashboard'],
    '/admin/users': ['Administration', 'Users'],
    '/admin/categories': ['Administration', 'Default Categories'],
    '/admin/reports': ['Administration', 'Reported Content'],
    '/admin/announcements': ['Administration', 'Announcements'],
  },
};

const ROLE_LABELS = {
  student: 'Student',
  mentor: 'Mentor',
  admin: 'Administrator',
};

const BELL_LINKS = {
  student: '/profile#announcements',
  mentor: '/mentor/announcements',
  admin: '/admin/announcements',
};

function getBreadcrumb(role, pathname) {
  if (
    role === 'mentor' &&
    (pathname.startsWith('/mentor/students/') ||
      pathname.startsWith('/mentor/goals/'))
  ) {
    return ['Menu', 'Shared Students'];
  }

  return BREADCRUMBS[role]?.[pathname] || ['Menu', 'Home'];
}

function getInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return '?';

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function recentAnnouncementCount(items) {
  if (!Array.isArray(items)) return 0;

  const end = new Date(`${TODAY}T00:00:00Z`);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 6);

  const from = start.toISOString().slice(0, 10);

  return items.filter((item) => {
    const date = String(item.date || '').slice(0, 10);

    return (
      item.status === 'published' &&
      date >= from &&
      date <= TODAY
    );
  }).length;
}

export default function Topbar({
  onMenuClick,
  menuOpen = false,
  menuButtonRef,
}) {
  const { role, signOut } = useAuth();
  const { currentUser, announcementsFor } = useData();
  const { theme, toggleTheme } = useTheme();

  const location = useLocation();
  const navigate = useNavigate();

  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const accountButtonRef = useRef(null);

  const [section, page] = getBreadcrumb(
    role,
    location.pathname
  );

  const roleLabel = ROLE_LABELS[role] || '';
  const bellLink = BELL_LINKS[role] || '/';

  const announcementAudience =
    role === 'student'
      ? 'students'
      : role === 'mentor'
        ? 'mentors'
        : null;

  const announcements =
    announcementAudience &&
    typeof announcementsFor === 'function'
      ? announcementsFor(announcementAudience)
      : [];

  const notificationCount = recentAnnouncementCount(
    announcements
  );

  const profileLink =
    role === 'student'
      ? '/profile'
      : role === 'mentor'
        ? '/mentor/profile'
        : null;

  useEffect(() => {
    setAccountOpen(false);
  }, [location.pathname, location.hash, location.key]);

  useEffect(() => {
    if (!accountOpen) return undefined;

    function handlePointerDown(event) {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target)
      ) {
        setAccountOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setAccountOpen(false);
        accountButtonRef.current?.focus();
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener(
        'pointerdown',
        handlePointerDown
      );
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [accountOpen]);

  function handleLogout() {
    setAccountOpen(false);
    signOut();
    navigate('/', { replace: true });
  }

  return (
    <header className="wq-topbar">
      <div className="wq-topbar-left">
        <button
          ref={menuButtonRef}
          type="button"
          className="wq-topbar-icon-button wq-topbar-menu-button"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          aria-controls="wq-appshell-navigation"
          onClick={onMenuClick}
        >
          <Icon name="menu" />
        </button>

        <nav
          className="wq-topbar-breadcrumb"
          aria-label="Breadcrumb"
        >
          <span className="wq-topbar-breadcrumb-section">
            {section}
          </span>
          <span
            className="wq-topbar-breadcrumb-divider"
            aria-hidden="true"
          >
            /
          </span>
          <span
            className="wq-topbar-breadcrumb-current"
            aria-current="page"
          >
            {page}
          </span>
        </nav>
      </div>

      <div className="wq-topbar-actions">
        <span className="wq-topbar-role">
          {roleLabel}
        </span>

        <button
          type="button"
          className="wq-topbar-icon-button"
          onClick={toggleTheme}
          aria-label={
            theme === 'dark'
              ? 'Switch to light mode'
              : 'Switch to dark mode'
          }
          title={
            theme === 'dark'
              ? 'Switch to light mode'
              : 'Switch to dark mode'
          }
        >
          <Icon
            name={theme === 'dark' ? 'sun' : 'moon'}
          />
        </button>

        <Link
          to={bellLink}
          className="wq-topbar-icon-button wq-topbar-bell"
          aria-label={
            notificationCount > 0
              ? `Announcements (${notificationCount} recent)`
              : 'Announcements'
          }
          title="Announcements"
        >
          <Icon name="bell" />

          {announcementAudience && notificationCount > 0 && (
            <span className="wq-topbar-notification-count">
              {notificationCount}
            </span>
          )}
        </Link>

        <div
          ref={accountRef}
          className="wq-topbar-account"
        >
          <button
            ref={accountButtonRef}
            type="button"
            className="wq-topbar-account-button"
            onClick={() =>
              setAccountOpen((previous) => !previous)
            }
            aria-label="Account menu"
            aria-haspopup="true"
            aria-expanded={accountOpen}
            aria-controls="wq-topbar-account-dropdown"
          >
            <span className="wq-topbar-avatar">
              {getInitials(currentUser?.name)}
            </span>

            <span className="wq-topbar-account-chevron">
              <Icon name="chevron-down" />
            </span>
          </button>

          {accountOpen && (
            <div
              id="wq-topbar-account-dropdown"
              className="wq-topbar-dropdown"
            >
              {profileLink && (
                <Link
                  to={profileLink}
                  className="wq-topbar-dropdown-item"
                  onClick={() => setAccountOpen(false)}
                >
                  <Icon name="user" />
                  <span>Profile</span>
                </Link>
              )}

              <button
                type="button"
                className="wq-topbar-dropdown-item"
                onClick={handleLogout}
              >
                <Icon name="log-out" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
