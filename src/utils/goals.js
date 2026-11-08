// Phase 0 helper placeholders. Owner replaces calculations in Phase 1.
export const goalProgress = (goal, loggedMinutes) => ({ logged: 0, target: goal?.targetMinutes ?? 0, percent: 0, status: "inProgress", diffMinutes: 0 });
export const isOnTrack = (status) => false;
export const goalSummary = (goals, totalsByCategory) => ({ onTrack: 0, total: goals.length });
export const goalMessage = (goal, loggedMinutes) => "";
