import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, EmptyState, Input, Modal, PageHeader, Select, Table, Textarea } from '../../components/ui';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { messages as M } from '../../utils/validators/account';
import './AdminUsers.css';

const roleName = role => role === 'student' ? 'Student' : 'Mentor';
const statusName = status => status === 'active' ? 'Active' : 'Suspended';

function AccountDetails({ user, updateUser, openStatus }) {
  const { show } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [reason, setReason] = useState('');
  const [notice, setNotice] = useState(null);
  function save(event) {
    event.preventDefault();
    const result = updateUser(user.id, { name, email });
    if (!result.ok) { setNotice({ tone: 'danger', text: result.error }); return; }
    setName(result.user.name); setEmail(result.user.email);
    setNotice({ tone: 'success', text: M.accountDetailsSaved });
    show(M.accountDetailsSaved);
  }
  return <>
    <form className="wq-adminusers-stack" onSubmit={save} noValidate aria-label="Account details">
      {notice && <Alert className={`wq-adminusers-alert wq-adminusers-alert--${notice.tone}`} tone={notice.tone}>{notice.text}</Alert>}
      <Input label="Name" required value={name} onChange={event => { setName(event.target.value); setNotice(null); }} />
      <Input label="Email" type="email" required value={email} onChange={event => { setEmail(event.target.value); setNotice(null); }} />
      <div className="wq-adminusers-readonly"><Input label="Role" value={roleName(user.role)} readOnly /><Input label="Status" value={statusName(user.status)} readOnly /></div>
      <div><Button type="submit">Save Changes</Button></div>
    </form>
    <section className="wq-adminusers-status"><h3>Status management</h3>
      <Textarea label="Reason" required value={reason} placeholder="Why is the status changing?" onChange={event => setReason(event.target.value)} />
      <div className="wq-adminusers-actions"><Button variant="danger" disabled={user.status !== 'active'} onClick={() => openStatus(user, reason)}>Suspend</Button><Button variant="secondary" disabled={user.status !== 'suspended'} onClick={() => openStatus(user, reason)}>Reactivate</Button></div>
    </section>
    <p className="wq-adminusers-note">Passwords, roles, activities and sharing permissions cannot be edited here.</p>
  </>;
}

export default function AdminUsers() {
  const { users, currentUser, updateUser, setUserStatus } = useData();
  const { show } = useToast();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { document.title = 'User management · Waqtuk'; }, []);
  const allowed = currentUser?.role === 'admin' && currentUser.status === 'active';
  const query = search.trim().toLowerCase();
  const rows = allowed ? users.filter(user => ['student', 'mentor'].includes(user.role) &&
    (role === 'all' || user.role === role) && (status === 'all' || user.status === status) &&
    `${user.name} ${user.email}`.toLowerCase().includes(query)) : [];
  const selected = rows.find(user => user.id === selectedId) || rows[0];
  function openStatus(user, initialReason = '') {
    setDialog({ id: user.id, name: user.name, next: user.status === 'active' ? 'suspended' : 'active' });
    setReason(initialReason); setError('');
  }
  function changeStatus(event) {
    event.preventDefault();
    const result = setUserStatus(dialog.id, dialog.next, reason);
    if (!result.ok) { setError(result.error); return; }
    show(dialog.next === 'suspended' ? 'Account suspended.' : 'Account reactivated.');
    setDialog(null); setReason(''); setError('');
  }
  const columns = [
    { key: 'name', header: 'Name', render: user => <button type="button" className="wq-adminusers-name" aria-pressed={selected?.id === user.id} onClick={() => setSelectedId(user.id)}>{user.name}</button> },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: user => roleName(user.role) },
    { key: 'status', header: 'Status', render: user => <Badge tone={user.status === 'active' ? 'success' : 'danger'}>{statusName(user.status)}</Badge> },
    { key: 'action', header: 'Action', render: user => <Button variant="secondary" size="sm" onClick={event => { event.stopPropagation(); setSelectedId(user.id); openStatus(user); }}>{user.status === 'active' ? 'Suspend' : 'Reactivate'}</Button> },
  ];
  if (!allowed) return <Alert tone="danger">{M.accountNotAllowed}</Alert>;
  return <div className="wq-adminusers">
    <PageHeader title="User management" subtitle="Search accounts, fix details and suspend or reactivate users." />
    <div className="wq-adminusers-grid">
      <Card className="wq-adminusers-card" title="Accounts">
        <div className="wq-adminusers-filters"><Input label="Search" placeholder="Name or email..." value={search} onChange={event => setSearch(event.target.value)} />
          <Select label="Role" value={role} onChange={event => setRole(event.target.value)} options={[{ value: 'all', label: 'All roles' }, { value: 'student', label: 'Student' }, { value: 'mentor', label: 'Mentor' }]} />
          <Select label="Status" value={status} onChange={event => setStatus(event.target.value)} options={[{ value: 'all', label: 'All statuses' }, { value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' }]} /></div>
        {rows.length ? <Table columns={columns} rows={rows} rowKey="id" onRowClick={user => setSelectedId(user.id)} /> : <EmptyState message="No matching accounts." />}
      </Card>
      <Card className="wq-adminusers-card" title="Account details">
        {selected ? <AccountDetails key={selected.id} user={selected} updateUser={updateUser} openStatus={openStatus} /> : <EmptyState message="Select an account to view its details." />}
      </Card>
    </div>
    <Modal open={Boolean(dialog)} size="sm" className="wq-adminusers-dialog" title={dialog?.next === 'suspended' ? 'Suspend this account?' : 'Reactivate this account?'} onClose={() => setDialog(null)}>
      <form className="wq-adminusers-stack" onSubmit={changeStatus} noValidate>
        <p>{dialog?.next === 'suspended' ? 'A reason is required. The user will be unable to log in.' : 'A reason is required. Reactivation does not restore previous sharing access.'}</p>
        <p><strong>{dialog?.name}</strong></p>
        <Textarea label="Reason" required value={reason} error={error === M.accountReasonRequired ? error : undefined} onChange={event => { setReason(event.target.value); setError(''); }} />
        {error && error !== M.accountReasonRequired && <Alert className="wq-adminusers-alert wq-adminusers-alert--danger" tone="danger">{error}</Alert>}
        <div className="wq-adminusers-actions"><Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button><Button type="submit" variant={dialog?.next === 'suspended' ? 'danger' : 'primary'}>{dialog?.next === 'suspended' ? 'Suspend' : 'Reactivate'}</Button></div>
      </form>
    </Modal>
  </div>;
}
