// Category and announcement selectors.

export function announcementsFor(data, ctx) { return (role) => []; }
export function getCategory(data) {return (id) => data.categories.find((a) => a.id === id);}

export function myCategories(data, ctx) {
  const userId = ctx.currentUser?.id;
  const defaults = data.categories.filter((c) => c.type === 'default' && c.active);
  const custom = data.categories.filter( (c) => c.type === 'custom'  && c.ownerId === userId );
  return [...defaults , ...custom ];
}

