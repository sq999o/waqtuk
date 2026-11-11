/*
  time.js  (Owner: Dev 1)
  Date and time helper functions used by many pages (Dashboard, Calendar,
  Reports, Goals, mentor pages). Plain JavaScript, no React.
  Durations are whole minutes, dates are 'YYYY-MM-DD', date-times are
  'YYYY-MM-DDTHH:mm'. Weeks run Monday to Sunday. "Today" is fixed to TODAY.
  Names and signatures are fixed by the agreements: do not rename them.
*/

export const TODAY = '2026-11-07';

// 2040 -> '34h 00m'
export function formatDuration(min) {
  const hours = Math.floor(min / 60);
  const minutes = min % 60;

  return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

// 330 -> '5.5h', 360 -> '6h'
export function formatHours(min) {
  const hours = Number((min / 60).toFixed(1));

  return `${hours}h`;
}

// Minutes between two date-times
export function durationMinutes(start, end) {
  return (new Date(end) - new Date(start)) / 60000;
}

// addDays('2026-11-07', -1) -> '2026-11-06'
export function addDays(date, n) {
  const d = new Date(date);

  // UTC methods avoid time zone shifts
  d.setUTCDate(d.getUTCDate() + n);

  return d.toISOString().slice(0, 10);
}

// Monday of the week that contains the date
export function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getUTCDay();

  let daysBack;

  if (day === 0) {
    daysBack = 6;
  } else {
    daysBack = day - 1;
  }

  return addDays(date, -daysBack);
}

// Sunday of the week that contains the date
export function endOfWeek(date) {
  const monday = startOfWeek(date);

  // Monday + 6 days = Sunday
  return addDays(monday, 6);
}

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// '2026-11-07' -> 'Sat 7 Nov 2026'
export function formatDateLong(date) {
  const d = new Date(date);

  return `${days[d.getUTCDay()]} ${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// '2026-11-07' -> '7 Nov'
export function formatDateShort(date) {
  const d = new Date(date);

  return `${d.getUTCDate()} ${months[d.getUTCMonth()]}`;
}

// '2026-11-07T09:00' -> '09:00'
export function formatTime(dateTime) {
  return dateTime.split('T')[1];
}

// '09:00–10:30' (an overnight activity prints the same way)
export function formatActivityRange(start, end) {
  return `${formatTime(start)}–${formatTime(end)}`;
}

// True when the date of the date-time is after TODAY
export function isFuture(dateTime) {
  const date = dateTime.slice(0, 10);

  return date > TODAY;
}

// Labels follow the prototype: 'Sat, 7 Nov 2026', '2 Nov – 8 Nov 2026', 'November 2026'
export function getPeriodRange(period, offset = 0) {
  if (period === 'day') {
    const date = addDays(TODAY, offset);
    const d = new Date(date);

    return {
      from: date,
      to: date,
      label: `${days[d.getUTCDay()]}, ${formatDateShort(date)} ${d.getUTCFullYear()}`
    };
  }

  if (period === 'week') {
    const monday = addDays(startOfWeek(TODAY), offset * 7);
    const sunday = endOfWeek(monday);

    return {
      from: monday,
      to: sunday,
      label: `${formatDateShort(monday)} – ${formatDateShort(sunday)} ${sunday.slice(0, 4)}`
    };
  }

  if (period === 'month') {
    const today = new Date(TODAY);
    const year = today.getUTCFullYear();
    const month = today.getUTCMonth() + offset;

    // Date.UTC fixes months outside 0-11 by itself
    const first = new Date(Date.UTC(year, month, 1));
    const last = new Date(Date.UTC(year, month + 1, 0));

    const from = first.toISOString().slice(0, 10);

    // The current month stops at TODAY, past months go to their last day
    const to = offset === 0 ? TODAY : last.toISOString().slice(0, 10);

    return {
      from,
      to,
      label: `${monthNames[first.getUTCMonth()]} ${first.getUTCFullYear()}`
    };
  }

  return { from: TODAY, to: TODAY, label: '' };
}

// The range to compare with
export function getPreviousRange(period, offset = 0) {
  if (period === 'day' || period === 'week') {
    return getPeriodRange(period, offset - 1);
  }

  if (period === 'month') {
    const current = getPeriodRange('month', offset);
    const previous = getPeriodRange('month', offset - 1);

    // Same number of days as the current month so far (1-7 Nov -> 1-7 Oct)
    const endDay = Number(current.to.slice(8, 10));
    const lastDay = Number(previous.to.slice(8, 10));
    const toDay = Math.min(endDay, lastDay);

    return {
      from: previous.from,
      to: `${previous.from.slice(0, 7)}-${String(toDay).padStart(2, '0')}`,
      label: previous.label
    };
  }

  return { from: TODAY, to: TODAY, label: '' };
}