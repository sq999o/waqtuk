// MentorProfile: the mentor's name and email, the same card as the student Profile. Owner: Dev 2.
import { useEffect } from 'react';
import { PageHeader } from '../../components/ui';
import ProfileCard from '../student/profile/ProfileCard';
import './MentorProfile.css';

export default function MentorProfile() {
  useEffect(() => { document.title = 'Profile · Waqtuk'; }, []);

  return (
    <div className="wq-mentor-profile">
      <PageHeader title="Profile" subtitle="Update your name and email." />
      {/* Same 1fr / 1.2fr grid as the prototype; the right column stays empty. */}
      <div className="wq-g wq-mentor-profile-grid">
        <ProfileCard />
      </div>
    </div>
  );
}
