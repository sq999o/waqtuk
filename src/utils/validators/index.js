// Frozen barrel. messages objects are combined here as section 5.6 requires.
export * from './activity.js';
export * from './category.js';
export * from './goal.js';
export * from './account.js';
import { messages as activityMessages } from './activity.js';
import { messages as categoryMessages } from './category.js';
import { messages as goalMessages } from './goal.js';
import { messages as accountMessages } from './account.js';
export const MESSAGES = { ...activityMessages, ...categoryMessages, ...goalMessages, ...accountMessages };
// Explicitly resolve the duplicate lowercase exports from the four validators.
export { MESSAGES as messages };
