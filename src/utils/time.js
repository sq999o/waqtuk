// Phase 0 helper placeholders. Owner replaces calculations in Phase 1.
export const TODAY = '2026-11-07';
export const formatDuration = (min) => "0h 00m";
export const formatHours = (min) => "0h";
export const durationMinutes = (start, end) => 0;
export const addDays = (date, n) => date;
export const startOfWeek = (date) => date;
export const endOfWeek = (date) => date;
export const formatDateLong = (date) => date;
export const formatDateShort = (date) => date;
export const formatTime = (dateTime) => "";
export const formatActivityRange = (start, end) => "";
export const isFuture = (dateTime) => false;
export const getPeriodRange = (period, offset = 0) => ({ from: TODAY, to: TODAY, label: "" });
export const getPreviousRange = (period, offset = 0) => ({ from: TODAY, to: TODAY, label: "" });
