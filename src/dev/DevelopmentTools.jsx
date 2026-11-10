// Owner: Dev 4. Development-only navigation; not the final login page.
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, homeForRole } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
const links = {
  student: [['Dashboard', '/dashboard'], ['Activities', '/activities'], ['Categories', '/categories'], ['Goals', '/goals'], ['Calendar', '/calendar'], ['Reports', '/reports'], ['Sharing', '/sharing'], ['Feedback', '/feedback'], ['Profile', '/profile']],
  mentor: [['Home', '/mentor'], ['Requests', '/mentor/requests'], ['Students', '/mentor/students'], ['Student detail', '/mentor/students/r1'], ['Goal detail', '/mentor/goals/g1'], ['Announcements', '/mentor/announcements'], ['Profile', '/mentor/profile']],
  admin: [['Dashboard', '/admin'], ['Users', '/admin/users'], ['Categories', '/admin/categories'], ['Reports', '/admin/reports'], ['Announcements', '/admin/announcements']],
};
export default function DevelopmentTools() {
  const { role, signIn, signOut } = useAuth();
  const { users, resetData } = useData();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  function preview(nextRole) {
    const user = users.find(item => item.role === nextRole && item.status === 'active');
    if (!user) return;
    signIn(user.id);
    navigate(homeForRole(nextRole));
  }
  return <aside aria-label="Development tools">
    <p><strong>Waqtuk development tools</strong> — use the forms below to test account sign-in. Other pages may still be placeholders.</p>
    {['student', 'mentor', 'admin'].map(item => <button key={item} type="button" onClick={() => preview(item)}>Preview {item}</button>)}
    <button type="button" onClick={() => { signOut(); navigate('/'); }}>Sign out</button>{' '}
    <button type="button" onClick={toggleTheme}>Switch to {theme === 'light' ? 'dark' : 'light'} mode</button>{' '}
    <Link to="/components">Components</Link>
    {pathname === '/components' && <details><summary>Reset preview data</summary><button type="button" onClick={resetData}>Reset data</button></details>}
    <ul>{(links[role] || []).map(([label, path]) => <li key={path}><Link to={path}>{label}</Link></li>)}</ul>
  </aside>;
}
