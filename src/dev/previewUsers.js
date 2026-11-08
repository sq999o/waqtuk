// Local development fixtures only; never production seed data or real authentication.
export const previewUsers = import.meta.env.DEV ? [
  { id: 's1', name: 'Hammad Albalawi', mentorName: 'Student A', email: 'student@example.com', role: 'student', status: 'active' },
  { id: 'm1', name: 'Mentor A', email: 'mentor@example.com', role: 'mentor', status: 'active' },
  { id: 'a1', name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active' },
] : [];
