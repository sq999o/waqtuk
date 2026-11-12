// Category and announcement selectors. Owner: Dev 2.

// Published announcements for 'students' or 'mentors' (plus 'all'), newest first.
export function announcementsFor(data) {
  return (role) => {
    if (role !== 'students' && role !== 'mentors') return [];
    return data.announcements
      .filter((a) => a.status === 'published' && (a.audience === role || a.audience === 'all'))
      .sort((a, b) => b.date.localeCompare(a.date));
  };
}

export function getCategory(data) { return (id) => data.categories.find((c) => c.id === id); }

// Active default categories, then the signed-in student's own categories.
export function myCategories(data, ctx) {
  const userId = ctx.currentUser?.id;
  const defaults = data.categories.filter((c) => c.type === 'default' && c.active);
  const custom = data.categories.filter((c) => c.type === 'custom' && c.ownerId === userId);
  return [...defaults, ...custom];
}
