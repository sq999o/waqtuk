
export function myActivities(data, ctx) {
  return data.activities
    .filter(a => a.studentId === ctx.currentUser?.id)
    .sort((a, b) => b.start.localeCompare(a.start));
}

export function getActivity(data, ctx) {
  return (id) => data.activities.find(a => a.id === id);
}

