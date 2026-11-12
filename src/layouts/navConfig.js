// Sidebar menus for each role, in the order and wording of the prototype. Owner: Dev 2.
// Each item is { label, to, icon, section }; `section` is the small title above a group of links.
export const NAV = {
  student: [
    { label: 'Dashboard', to: '/dashboard', icon: 'dashboard', section: 'Overview' },
    { label: 'Activities', to: '/activities', icon: 'list', section: 'Overview' },
    { label: 'Calendar', to: '/calendar', icon: 'calendar', section: 'Overview' },
    { label: 'Reports', to: '/reports', icon: 'chart', section: 'Overview' },
    { label: 'Goals', to: '/goals', icon: 'target', section: 'Planning' },
    { label: 'Categories', to: '/categories', icon: 'tag', section: 'Planning' },
    { label: 'Sharing', to: '/sharing', icon: 'share', section: 'Mentor' },
    { label: 'Mentor Feedback', to: '/feedback', icon: 'message', section: 'Mentor' },
    { label: 'Announcements', to: '/profile#announcements', icon: 'bell', section: 'Account' },
    { label: 'Profile', to: '/profile', icon: 'user', section: 'Account' },
  ],
  mentor: [
    { label: 'Home', to: '/mentor', icon: 'home', section: 'Menu' },
    { label: 'Sharing Requests', to: '/mentor/requests', icon: 'inbox', section: 'Menu' },
    { label: 'Shared Students', to: '/mentor/students', icon: 'users', section: 'Menu' },
    { label: 'Announcements', to: '/mentor/announcements', icon: 'bell', section: 'Menu' },
    { label: 'Profile', to: '/mentor/profile', icon: 'user', section: 'Account' },
  ],
  admin: [
    { label: 'Dashboard', to: '/admin', icon: 'dashboard', section: 'Administration' },
    { label: 'Users', to: '/admin/users', icon: 'users', section: 'Administration' },
    { label: 'Default Categories', to: '/admin/categories', icon: 'tag', section: 'Administration' },
    { label: 'Reported Content', to: '/admin/reports', icon: 'flag', section: 'Administration' },
    { label: 'System Usage', to: '/admin#usage', icon: 'chart', section: 'Administration' },
    { label: 'Announcements', to: '/admin/announcements', icon: 'bell', section: 'Administration' },
  ],
};
