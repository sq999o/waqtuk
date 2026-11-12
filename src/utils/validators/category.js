// Category and announcement validation. Texts copied from the prototype states pages. Owner: Dev 2.
export const messages = {
  categoryNameRequired: 'Category name is required.',
  categoryDuplicate: 'A category with this name already exists.',
  categoryDefaultDuplicate: 'A default category with this name already exists.',
  categoryAdded: 'Category added.',
  categoryRenamed: 'Category renamed.',
  categorySaved: 'Category saved.',
  // Defensive cases not illustrated in the prototype states.
  categoryUnavailable: 'Category unavailable: it was removed or changed.',
  categoryInvalidReassign: 'Choose another category to reassign to.',
  announcementTitleRequired: 'Title is required.',
  announcementMessageRequired: 'Message is required.',
  announcementInvalidAudience: 'Invalid audience: choose Students, Mentors or All users.',
  announcementSaved: 'Announcement saved.',
  announcementUnavailable: 'Announcement unavailable: it was removed or changed.',
};

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

// "This category is still used by 4 activities and 1 goal. Reassign them to continue."
export function categoryInUseMessage(activityCount, goalCount) {
  const parts = [];
  if (activityCount) parts.push(activityCount === 1 ? '1 activity' : `${activityCount} activities`);
  if (goalCount) parts.push(plural(goalCount, 'goal'));
  return `This category is still used by ${parts.join(' and ')}. Reassign them to continue.`;
}

const sameName = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

// ownerId null means a default category (administrator); otherwise a student's own category.
export function validateCategoryName(name, { categories = [], ownerId = null, exceptId } = {}) {
  if (typeof name !== 'string' || !name.trim()) return { ok: false, error: messages.categoryNameRequired };
  const others = categories.filter((c) => c.id !== exceptId && sameName(c.name, name));
  if (ownerId === null) {
    return others.some((c) => c.type === 'default')
      ? { ok: false, error: messages.categoryDefaultDuplicate } : { ok: true };
  }
  return others.some((c) => c.type === 'default' || c.ownerId === ownerId)
    ? { ok: false, error: messages.categoryDuplicate } : { ok: true };
}

export const AUDIENCES = ['students', 'mentors', 'all'];

export function validateAnnouncement(a) {
  if (typeof a?.title !== 'string' || !a.title.trim()) return { ok: false, error: messages.announcementTitleRequired };
  if (typeof a.body !== 'string' || !a.body.trim()) return { ok: false, error: messages.announcementMessageRequired };
  if (!AUDIENCES.includes(a.audience)) return { ok: false, error: messages.announcementInvalidAudience };
  return { ok: true };
}
