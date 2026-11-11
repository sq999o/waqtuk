/*
  stats.js  (Owner: Dev 1)
  Statistics helpers for Dashboard, Reports, Goals and the mentor pages.
  Plain JavaScript, no React. Durations are whole minutes.
  An activity counts fully on the day it STARTS (an overnight activity is not split).
  Names and signatures are fixed by the agreements: do not rename them.
*/

import { durationMinutes } from './time.js';

// Total minutes per category for activities that start between from and to
// Example result: { 'cat-study': 360, 'cat-work': 510 }
export function sumByCategory(activities, from, to) {
  const totals = {};

  for (const activity of activities) {
    // Only the start day decides if the activity is in the range
    const date = activity.start.slice(0, 10);

    if (date < from || date > to) {
      continue;
    }

    const id = activity.categoryId;
    const minutes = durationMinutes(activity.start, activity.end);

    totals[id] = (totals[id] || 0) + minutes;
  }

  return totals;
}

// Sum of all minutes in the range
export function totalMinutes(activities, from, to) {
  const totals = sumByCategory(activities, from, to);

  return Object.values(totals).reduce((sum, value) => sum + value, 0);
}

// Whole-number percentages that add up to exactly 100 (largest remainder method)
// [360, 510, 330, 180, 300, 360] -> [18, 25, 16, 9, 15, 17]
export function percentages(values) {
  const total = values.reduce((sum, value) => sum + value, 0);

  if (total === 0) {
    return values.map(() => 0);
  }

  // Step 1: round every share down
  const result = values.map(value =>
    Math.floor((value * 100) / total)
  );

  // Integer remainders avoid decimal rounding problems
  const remainders = values.map(value =>
    (value * 100) % total
  );

  // Step 2: how many points are still missing from 100
  const left = 100 - result.reduce((sum, value) => sum + value, 0);

  const indexes = values.map((value, index) => index);

  // Biggest remainder first; a tie goes to the item that comes first
  indexes.sort((a, b) => {
    if (remainders[b] !== remainders[a]) {
      return remainders[b] - remainders[a];
    }

    return a - b;
  });

  // Step 3: give +1 to the first items of that order
  for (let i = 0; i < left; i++) {
    result[indexes[i]]++;
  }

  return result;
}

// Id of the category with the largest total; a tie goes to the first in the list
export function topCategoryId(totals, categories) {
  let bestId;
  let bestMinutes = 0;

  for (const category of categories) {
    const minutes = totals[category.id] || 0;

    // Strict > keeps the first category when there is a tie
    if (minutes > bestMinutes) {
      bestMinutes = minutes;
      bestId = category.id;
    }
  }

  return bestId;
}

// Difference between two totals and the change in percent
// compare(2040, 1840) -> { diffMinutes: 200, percent: 11 }
export function compare(current, previous) {
  const diffMinutes = current - previous;

  // The agreements do not define this case: percent is 0 when previous is 0
  if (previous === 0) {
    return {
      diffMinutes,
      percent: 0
    };
  }

  const percent = Math.round((diffMinutes / previous) * 100);

  return {
    diffMinutes,
    percent
  };
}
