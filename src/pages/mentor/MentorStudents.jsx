import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, ConfirmDialog, EmptyState, Input, PageHeader, Select, StatCard, Table } from '../../components/ui';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { TODAY, formatDateShort } from '../../utils/time';
import './MentorStudents.css';

const scopeLabel = scope => scope.map(value => value === 'summary' ? 'Summary' : 'Reports').join(', ') || 'Goals only';
export default function MentorStudents() {
  const { sharedStudents = [], getCategory, goals = [], endSharing } = useData();
  const { show } = useToast();
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState('all');
  const [endId, setEndId] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { document.title = 'Shared students · Waqtuk'; }, []);
  const ending = sharedStudents.filter(row => row.request.to <= TODAY).sort((a, b) => a.request.to.localeCompare(b.request.to));
  const rows = sharedStudents.filter(({ student, request }) => student.mentorName.toLowerCase().includes(search.trim().toLowerCase()) && (scope === 'all' || request.scope.includes(scope))).map(row => ({ ...row, id: row.request.id }));
  const goalNames = request => request.goalIds.map(id => { const goal = goals.find(item => item.id === id); return goal ? getCategory(goal.categoryId)?.name || 'Unavailable category' : 'Unavailable goal'; }).join(', ') || 'None';
  function confirmEnd() { const id = endId; setEndId(null); const result = endSharing(id); if (!result.ok) { setError(result.error); return; } setError(''); show('Sharing ended. The student was removed from your list.'); }
  const columns = [
    { key: 'student', header: 'Student', render: row => <strong>{row.student.mentorName}</strong> },
    { key: 'scope', header: 'Data shared', render: row => scopeLabel(row.request.scope) },
    { key: 'period', header: 'Approved period', render: row => `${formatDateShort(row.request.from)} – ${formatDateShort(row.request.to)}` },
    { key: 'goals', header: 'Goals', render: row => goalNames(row.request) },
    { key: 'status', header: 'Status', render: () => <Badge tone="success">Accepted</Badge> },
    { key: 'actions', header: 'Actions', render: row => <div className="wq-mentor-actions"><Button size="sm" to={`/mentor/students/${row.request.id}`}>Open</Button><Button size="sm" variant="secondary" onClick={() => setEndId(row.request.id)}>End</Button></div> },
  ];
  const target = sharedStudents.find(row => row.request.id === endId);
  return <div className="wq-mentor-students wq-mentor-page">
    <PageHeader className="wq-mentor-header" title="Shared students" subtitle="Students who shared their data with you, and what you can see." />
    {error && <Alert className="wq-mentor-alert" tone="danger">{error}</Alert>}
    <div className="wq-mentor-stats wq-g"><StatCard label="Shared students" value={sharedStudents.length} hint="With active access" /><StatCard label="Goals shared" value={sharedStudents.reduce((sum, row) => sum + row.request.goalIds.length, 0)} hint="You can give feedback" /><StatCard label="Ending soon" value={ending.length} hint={ending[0] ? `${ending[0].student.mentorName} · ${formatDateShort(ending[0].request.to)}` : 'No access ending yet'} /></div>
    <Card className="wq-mentor-card" title="Shared students">
      {sharedStudents.length ? <div className="wq-mentor-stack"><div className="wq-mentor-filters wq-g"><Input label="Search" value={search} placeholder="Search by student name..." onChange={event => setSearch(event.target.value)} /><Select label="Scope" value={scope} options={[{ value: 'all', label: 'All scopes' }, { value: 'summary', label: 'Summary' }, { value: 'reports', label: 'Reports' }]} onChange={event => setScope(event.target.value)} /></div>
        {rows.length ? <Table columns={columns} rows={rows} rowKey="id" /> : <EmptyState message="No students match your search." />}</div>
        : <EmptyState message="No students are sharing with you yet. Accepted requests appear here." />}
    </Card>
    <ConfirmDialog open={Boolean(endId)} tone="danger" title="End sharing?" message={target ? `${target.student.mentorName} will no longer share their data with you.` : 'The student will no longer share their data with you.'} confirmLabel="End Sharing" cancelLabel="Cancel" onCancel={() => setEndId(null)} onConfirm={confirmEnd} />
  </div>;
}
