// Phase 0 in-memory bridge. Owner: Dev 2 must add persistence and complete this in Phase 1.
import { createContext, useContext, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import * as allActions from './actions';
import * as allSelectors from './selectors';
import { previewUsers } from '../dev/previewUsers';
import usersSeed from '../data/users.json';
import categoriesSeed from '../data/categories.json';
import activitiesSeed from '../data/activities.json';
import goalsSeed from '../data/goals.json';
import sharingRequestsSeed from '../data/sharing.json';
import feedbackSeed from '../data/feedback.json';
import announcementsSeed from '../data/announcements.json';
import contentReportsSeed from '../data/reports.json';
import usageSeed from '../data/usage.json';
const DataContext = createContext(null);
function freshData() {
  return structuredClone({
    categories: categoriesSeed,
    activities: activitiesSeed,
    goals: goalsSeed,
    sharingRequests: sharingRequestsSeed,
    feedback: feedbackSeed,
    announcements: announcementsSeed,
    contentReports: contentReportsSeed,
    usage: usageSeed,
    // Temporary preview fixtures only while Dev 4's real user seed is empty.
    users: import.meta.env.DEV && usersSeed.length === 0 ? previewUsers : usersSeed,
  });
}
export function DataProvider({ children }) {
  const { userId } = useAuth();
  const [data, setData] = useState(freshData);
  const dataRef = useRef(data);
  const ctx = { currentUser: data.users.find(user => user.id === userId) };
  const actions = Object.fromEntries(Object.entries(allActions).map(([name, fn]) => [name, (...args) => {
    const current = dataRef.current;
    const currentCtx = { currentUser: current.users.find(user => user.id === userId) };
    // Preserve all public arguments. For example updateUser(id, changes).
    const out = fn(current, ...args, currentCtx);
    if (out.data !== current) { dataRef.current = out.data; setData(out.data); }
    return out.result;
  }]));
  const selectors = Object.fromEntries(Object.entries(allSelectors).map(([name, fn]) => [name, fn(data, ctx)]));
  function resetData() { const next = freshData(); dataRef.current = next; setData(next); }
  return <DataContext.Provider value={{ ...data, ...ctx, ...actions, ...selectors, resetData }}>{children}</DataContext.Provider>;
}
export function useData() { return useContext(DataContext); }
