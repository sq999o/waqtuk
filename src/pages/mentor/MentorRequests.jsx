import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, ConfirmDialog, EmptyState, PageHeader, StatCard, Table } from '../../components/ui';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { formatDateShort, formatHours } from '../../utils/time';
import './MentorRequests.css';

const scopeLabel = scope => scope.map(value => value === 'summary' ? 'Summary' : 'Reports').join(', ') || 'Goals only';
export default function MentorRequests() {
  const { mentorRequests = [], getUser, getCategory, goals = [], acceptRequest, declineRequest } = useData();
  const { show } = useToast();
  const [declineId, setDeclineId] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { document.title = 'Sharing requests · Waqtuk'; }, []);
  const pending = mentorRequests.filter(request => request.status === 'pending');
  const accepted = mentorRequests.filter(request => request.status === 'accepted');
  const declined = mentorRequests.filter(request => request.status === 'declined');
  const decisions = mentorRequests.filter(request => ['accepted', 'declined'].includes(request.status) && request.decidedOn).sort((a, b) => b.decidedOn.localeCompare(a.decidedOn));
  const student = request => getUser(request.studentId);
  const name = request => student(request)?.mentorName || 'Unavailable student';
  const goalNames = request => request.goalIds.map(id => { const goal = goals.find(item => item.id === id); return goal ? `${getCategory(goal.categoryId)?.name || 'Unavailable category'} (${goal.direction === 'atLeast' ? 'at least' : 'at most'} ${formatHours(goal.targetMinutes)})` : 'Unavailable goal'; }).join(', ') || 'None';
  function run(id, action, success) { const result = action(id); if (!result.ok) { setError(result.error); return; } setError(''); show(success); }
  function confirmDecline() { const id = declineId; setDeclineId(null); run(id, declineRequest, 'Request declined.'); }
  const columns = [
    { key: 'student', header: 'Student', render: row => name(row) },
    { key: 'decision', header: 'Decision', render: row => <Badge tone={row.status === 'accepted' ? 'success' : 'danger'}>{row.status === 'accepted' ? 'Accepted' : 'Declined'}</Badge> },
    { key: 'date', header: 'Date', render: row => formatDateShort(row.decidedOn) },
    { key: 'scope', header: 'Scope', render: row => scopeLabel(row.scope) },
  ];
  return <div className="wq-mentor-requests wq-mentor-page">
    <PageHeader className="wq-mentor-header" title="Sharing requests" subtitle="Accept or decline requests from students who want to share with you." />
    {error && <Alert className="wq-mentor-alert" tone="danger">{error}</Alert>}
    <div className="wq-mentor-stats wq-g"><StatCard label="Pending" value={pending.length} hint="Waiting for your decision" /><StatCard label="Accepted this term" value={accepted.length} hint="Now in Shared students" /><StatCard label="Declined" value={declined.length} hint="No access was granted" /></div>
    <div className="wq-mentor-requests-grid wq-g">
      <Card className="wq-mentor-card" title="Pending requests">
        {pending.length ? <div className="wq-mentor-stack">{pending.map(request => <article className="wq-mentor-panel" key={request.id} data-request-id={request.id}>
          <div className="wq-mentor-heading"><h3>{name(request)}</h3><Badge tone="warning">Pending</Badge></div><p>{student(request)?.email}</p><p>Proposed range: {formatDateShort(request.from)} – {formatDateShort(request.to)}</p><p>Data: {scopeLabel(request.scope)}</p><p>Goals: {goalNames(request)}</p>
          <div className="wq-mentor-actions"><Button onClick={() => run(request.id, acceptRequest, `Request accepted. ${name(request)} is now in Shared students.`)}>Accept</Button><Button variant="secondary" onClick={() => setDeclineId(request.id)}>Decline</Button></div>
        </article>)}<p className="wq-mentor-note">You will see only the dates, data and goals the student approves. Activity details are not shown until you accept.</p></div>
          : <EmptyState message="No pending sharing requests. New requests appear here." />}
      </Card>
      <Card className="wq-mentor-card" title="Recent decisions"><Table columns={columns} rows={decisions} rowKey="id" emptyText="No recent decisions." /></Card>
    </div>
    <ConfirmDialog open={Boolean(declineId)} tone="danger" title="Decline this request?" message="The student is told the request was declined." confirmLabel="Decline Request" cancelLabel="Cancel" onCancel={() => setDeclineId(null)} onConfirm={confirmDecline} />
  </div>;
}
