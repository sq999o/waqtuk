// ProfileCard: name and email editing, read-only role and Log Out. Used by Profile and MentorProfile. Owner: Dev 2.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Icon, Input } from '../../../components/ui';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { MESSAGES } from '../../../utils/validators';
import './ProfileCard.css';

const ROLE_LABELS = { student: 'Student', mentor: 'Academic Mentor', admin: 'Administrator' };

const EMAIL_ERRORS = [MESSAGES.accountInvalidEmail, MESSAGES.accountEmailUsed, MESSAGES.accountDuplicateEmail];

// Show each message under the field it is about.
function errorField(error, values) {
  if (EMAIL_ERRORS.includes(error)) return 'email';
  if (error === MESSAGES.accountProfileRequired) return values.name.trim() ? 'email' : 'name';
  return 'name';
}

export default function ProfileCard({ className = '' }) {
  const { currentUser, updateProfile } = useData();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [values, setValues] = useState({ name: currentUser?.name ?? '', email: currentUser?.email ?? '' });
  const [error, setError] = useState(null); // { field, text }

  function change(field, value) {
    setValues({ ...values, [field]: value });
    if (error?.field === field) setError(null);
  }

  function save(event) {
    event.preventDefault();
    const result = updateProfile(values);
    if (!result.ok) { setError({ field: errorField(result.error, values), text: result.error }); return; }
    setValues({ name: result.user.name, email: result.user.email });
    toast.show(MESSAGES.accountProfileUpdated);
  }

  function logOut() {
    signOut();
    navigate('/', { replace: true });
  }

  return (
    <Card title="Profile" className={className}>
      <form className="wq-profile-card-form" onSubmit={save} noValidate>
        <Input label="Name" required placeholder="Full name" value={values.name} autoComplete="name"
          error={error?.field === 'name' ? error.text : undefined} onChange={(e) => change('name', e.target.value)} />
        <Input label="Email" type="email" required placeholder="email@example.com" value={values.email}
          autoComplete="email" error={error?.field === 'email' ? error.text : undefined}
          onChange={(e) => change('email', e.target.value)} />
        <Input label="Role" value={ROLE_LABELS[currentUser?.role] ?? ''} disabled readOnly
          hint="Your role cannot be changed." />
        <div className="wq-profile-card-buttons">
          <Button type="submit">Save Changes</Button>
          <Button variant="secondary" iconLeft={<Icon name="log-out" size={18} />} onClick={logOut}>Log Out</Button>
        </div>
      </form>
    </Card>
  );
}
