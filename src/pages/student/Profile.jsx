// Profile: the student's details and the announcements for students. Owner: Dev 2.
import { useEffect, useState } from 'react';
import { Card, EmptyState, PageHeader } from '../../components/ui';
import { useData } from '../../context/DataContext';
import { formatDateShort } from '../../utils/time';
import ProfileCard from './profile/ProfileCard';
import './Profile.css';

// '2026-11-05' -> '5 Nov 2026'
const dateLabel = (date) => `${formatDateShort(date)} ${date.slice(0, 4)}`;

export default function Profile() {
  const { announcementsFor } = useData();
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => { document.title = 'Profile and announcements · Waqtuk'; }, []);

  const announcements = typeof announcementsFor === 'function' ? announcementsFor('students') : [];
  // The first announcement is selected at the start.
  const selected = announcements.find((a) => a.id === selectedId) || announcements[0];

  return (
    <div className="wq-profile">
      <PageHeader title="Profile and announcements" subtitle="Update your details and read news from the Waqtuk team." />

      <div className="wq-g wq-profile-grid">
        <ProfileCard />

        {/* The bell links to /profile#announcements, so this id must stay. */}
        <div id="announcements" className="wq-profile-announcements">
          <Card title="Announcements">
            {announcements.length === 0 ? (
              <EmptyState title="No announcements available." />
            ) : (
              <div className="wq-profile-ann-stack">
                <ul className="wq-profile-ann-list">
                  {announcements.map((a) => (
                    <li key={a.id}>
                      <button type="button" aria-pressed={a.id === selected.id}
                        className={`wq-profile-ann-item ${a.id === selected.id ? 'is-selected' : ''}`}
                        onClick={() => setSelectedId(a.id)}>
                        <span className="wq-profile-ann-title">{a.title}</span>
                        <span className="wq-profile-ann-date">{dateLabel(a.date)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <article className="wq-profile-ann-detail" aria-live="polite">
                  <h3>{selected.title}</h3>
                  <p className="wq-profile-ann-meta">Published {dateLabel(selected.date)}</p>
                  <p className="wq-profile-ann-body">{selected.body}</p>
                </article>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
