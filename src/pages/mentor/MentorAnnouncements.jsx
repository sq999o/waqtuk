// MentorAnnouncements: published announcements for mentors with search and a detail panel. Owner: Dev 2.
import { useEffect, useState } from 'react';
import { Badge, Card, EmptyState, Input, PageHeader } from '../../components/ui';
import { useData } from '../../context/DataContext';
import { TODAY, addDays, formatDateShort } from '../../utils/time';
import './MentorAnnouncements.css';

const AUDIENCE_LABELS = { students: 'Students', mentors: 'Mentors', all: 'All users' };

// '2026-11-05' -> '5 Nov 2026'
const dateLabel = (date) => `${formatDateShort(date)} ${date.slice(0, 4)}`;

// "New" means published in the 7 days up to TODAY.
const isNew = (item) => item.date >= addDays(TODAY, -6) && item.date <= TODAY;

export default function MentorAnnouncements() {
  const { announcementsFor } = useData();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => { document.title = 'Announcements · Waqtuk'; }, []);

  const all = typeof announcementsFor === 'function' ? announcementsFor('mentors') : [];
  const query = search.trim().toLowerCase();
  const matches = all.filter((a) => `${a.title} ${a.body}`.toLowerCase().includes(query));
  // The first row is selected at the start, and again when the search hides the selected one.
  const selected = matches.find((a) => a.id === selectedId) || matches[0];

  return (
    <div className="wq-mentor-announcements">
      <PageHeader title="Announcements" subtitle="Messages from administrators for mentors." />

      <Card title="Announcements for mentors">
        {all.length === 0 ? (
          <EmptyState title="No announcements for mentors." message="Drafts and unpublished items are hidden." />
        ) : (
          <div className="wq-g wq-mentor-announcements-grid">
            <div className="wq-mentor-announcements-side">
              <Input label="Search" type="search" placeholder="Search announcements..." value={search}
                onChange={(e) => setSearch(e.target.value)} />
              {matches.length === 0 ? (
                <p className="wq-mentor-announcements-none">No announcements match your search.</p>
              ) : (
                <ul className="wq-mentor-announcements-list">
                  {matches.map((a) => (
                    <li key={a.id}>
                      <button type="button" aria-pressed={a.id === selected?.id}
                        className={`wq-mentor-announcements-item ${a.id === selected?.id ? 'is-selected' : ''}`}
                        onClick={() => setSelectedId(a.id)}>
                        <span>{a.title}</span>
                        {isNew(a) && <Badge tone="info">New</Badge>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {selected && (
              <article className="wq-mentor-announcements-detail" aria-live="polite">
                <h3>{selected.title}</h3>
                <p className="wq-mentor-announcements-meta">
                  Audience: {AUDIENCE_LABELS[selected.audience]} · {dateLabel(selected.date)}
                </p>
                <p className="wq-mentor-announcements-body">{selected.body}</p>
              </article>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
