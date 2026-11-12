// Sidebar: brand, signed-in user, role menu from navConfig and Log Out. Owner: Dev 2.
// AppShell (Dev 3) places it in the left column on desktop and in a drawer under 820 px.
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Icon } from '../components/ui';
import { NAV } from './navConfig';
import './Sidebar.css';

const ROLE_LABELS = { student: 'Student', mentor: 'Academic Mentor', admin: 'Administrator' };

// 'Hammad Albalawi' -> 'HA'
function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((word) => word[0].toUpperCase()).join('');
}

// The link for the current page. A link with a hash (/profile#announcements) wins only when the
// hash matches; nested pages such as /mentor/students/r1 keep their parent link highlighted.
function findActive(items, { pathname, hash }) {
  const split = (to) => { const [path, h = ''] = to.split('#'); return { path, hash: h ? `#${h}` : '' }; };
  const exactHash = items.find((item) => split(item.to).hash && split(item.to).path === pathname && split(item.to).hash === hash);
  if (exactHash) return exactHash;
  const exact = items.find((item) => !split(item.to).hash && split(item.to).path === pathname);
  if (exact) return exact;
  return items.find((item, index) => index > 0 && !split(item.to).hash && pathname.startsWith(`${split(item.to).path}/`));
}

export default function Sidebar() {
  const { role, signOut } = useAuth();
  const { currentUser } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const items = NAV[role] ?? [];
  const active = findActive(items, location);

  // Group the items by section, keeping their order.
  const sections = [];
  for (const item of items) {
    const last = sections[sections.length - 1];
    if (last && last.title === item.section) last.items.push(item);
    else sections.push({ title: item.section, items: [item] });
  }

  function handleLogOut() {
    signOut();
    navigate('/', { replace: true });
  }

  return (
    <div className="wq-sidebar">
      <div className="wq-sidebar-brand">
        <span className="wq-sidebar-logo"><Icon name="clock" size={18} /></span>
        <span className="wq-sidebar-name">Waqtuk</span>
      </div>

      {currentUser && (
        <div className="wq-sidebar-user">
          <span className="wq-sidebar-avatar" aria-hidden="true">{initials(currentUser.name)}</span>
          <span className="wq-sidebar-user-text">
            <span className="wq-sidebar-user-name">{currentUser.name}</span>
            <span className="wq-sidebar-user-role">{ROLE_LABELS[role]}</span>
          </span>
        </div>
      )}

      <nav className="wq-sidebar-nav" aria-label="Main">
        {sections.map((section) => (
          <div key={section.title} className="wq-sidebar-section">
            <span className="wq-sidebar-title">{section.title}</span>
            {section.items.map((item) => (
              <Link key={item.to} to={item.to} aria-current={item === active ? 'page' : undefined}
                className={`wq-sidebar-link ${item === active ? 'wq-sidebar-link--active' : ''}`}>
                <Icon name={item.icon} size={18} />
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="wq-sidebar-foot">
        <button type="button" className="wq-sidebar-link wq-sidebar-logout" onClick={handleLogOut}>
          <Icon name="log-out" size={18} />
          Log Out
        </button>
      </div>
    </div>
  );
}
