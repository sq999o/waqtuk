// Owner: Dev 4. All 22 application routes are registered from Phase 0.
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth, homeForRole } from './context/AuthContext';
import { useData } from './context/DataContext';
import AppShell from './layouts/AppShell';
import AuthLayout from './layouts/AuthLayout';
import LoginPage from './pages/auth/LoginPage';
import Dashboard from './pages/student/Dashboard';
import Activities from './pages/student/Activities';
import Categories from './pages/student/Categories';
import Goals from './pages/student/Goals';
import Calendar from './pages/student/Calendar';
import Reports from './pages/student/Reports';
import Sharing from './pages/student/Sharing';
import Feedback from './pages/student/Feedback';
import Profile from './pages/student/Profile';
import MentorHome from './pages/mentor/MentorHome';
import MentorRequests from './pages/mentor/MentorRequests';
import MentorStudents from './pages/mentor/MentorStudents';
import MentorStudent from './pages/mentor/MentorStudent';
import MentorGoal from './pages/mentor/MentorGoal';
import MentorAnnouncements from './pages/mentor/MentorAnnouncements';
import MentorProfile from './pages/mentor/MentorProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminReports from './pages/admin/AdminReports';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
const DevelopmentTools = import.meta.env.DEV ? lazy(() => import('./dev/DevelopmentTools')) : null;
const ComponentsPreview = import.meta.env.DEV ? lazy(() => import('./pages/dev/ComponentsPreview')) : null;
function ActiveSession({ role, children }) {
  const auth = useAuth();
  const { currentUser } = useData();
  if (!auth.isAuthenticated || !currentUser || currentUser.status !== 'active') return <Navigate to="/" replace />;
  if (currentUser.role !== role) return <Navigate to={homeForRole(currentUser.role)} replace />;
  return children ?? <Outlet />;
}
function LoginRoute() {
  const { isAuthenticated } = useAuth();
  const { currentUser } = useData();
  if (isAuthenticated && currentUser?.status === 'active') return <Navigate to={homeForRole(currentUser.role)} replace />;
  return <LoginPage />;
}
export default function AppRoutes() {
  return <>
    {import.meta.env.DEV && <Suspense fallback={null}><DevelopmentTools /></Suspense>}
    <Routes>
      <Route element={<AuthLayout />}><Route path="/" element={<LoginRoute />} /></Route>
      <Route element={<ActiveSession role="student" />}><Route element={<AppShell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/sharing" element={<Sharing />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/profile" element={<Profile />} />
      </Route></Route>
      <Route element={<ActiveSession role="mentor" />}><Route element={<AppShell />}>
        <Route path="/mentor" element={<MentorHome />} />
        <Route path="/mentor/requests" element={<MentorRequests />} />
        <Route path="/mentor/students" element={<MentorStudents />} />
        <Route path="/mentor/students/:id" element={<MentorStudent />} />
        <Route path="/mentor/goals/:id" element={<MentorGoal />} />
        <Route path="/mentor/announcements" element={<MentorAnnouncements />} />
        <Route path="/mentor/profile" element={<MentorProfile />} />
      </Route></Route>
      <Route element={<ActiveSession role="admin" />}><Route element={<AppShell />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
      </Route></Route>
      {import.meta.env.DEV && <Route path="/components" element={<Suspense fallback={null}><ComponentsPreview /></Suspense>} />}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>;
}
