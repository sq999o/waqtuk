import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, ConfirmDialog, EmptyState, Input, PageHeader, StatCard } from '../../components/ui';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { TODAY, addDays, formatDateLong, formatDateShort, formatHours } from '../../utils/time';
import './MentorHome.css';

const scopeLabel = scope => scope.map(value => value === 'summary' ? 'Summary' : 'Reports').join(', ') || 'Goals only';
const rangeLabel = request => `${formatDateShort(request.from)} – ${formatDateShort(request.to)}`;

export default function MentorHome() {
  const { mentorRequests = [], sharedStudents = [], announcementsFor, getUser, getCategory,
    goals = [], acceptRequest, declineRequest, endSharing } = useData();
  const { show } = useToast();
  const [search, setSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { document.title = 'Mentor home · Waqtuk'; }, []);

  const pending = mentorRequests.filter(request => request.status === 'pending');
  const announcements = typeof announcementsFor === 'function' ? announcementsFor('mentors') : [];
  const newAnnouncements = announcements.filter(item => item.date >= addDays(TODAY, -6) && item.date <= TODAY).length;
  const matches = sharedStudents.filter(({ student }) => student.mentorName.toLowerCase().includes(search.trim().toLowerCase()));
  const selectedStudent = matches.find(row => row.request.id === selectedStudentId) || matches[0];
  const selectedAnnouncement = announcements.find(item => item.id === selectedAnnouncementId) || announcements[0];
  const firstPending = pending[0];
  const nextPending = pending[1];
  const studentName = request => getUser(request?.studentId)?.mentorName || 'Unavailable student';
  const goalNames = request => request.goalIds.map(id => {
    const goal = goals.find(item => item.id === id);
    if (!goal) return 'Unavailable goal';
    return `${getCategory(goal.categoryId)?.name || 'Unavailable category'} (${goal.direction === 'atLeast' ? 'at least' : 'at most'} ${formatHours(goal.targetMinutes)})`;
  }).join(', ') || 'None';

  function runRequest(id, action, success) {
    const result = action(id);
    if (!result.ok) { setError(result.error); return; }
    setError(''); show(success);
  }
  function confirmDialog() {
    const current = dialog;
    setDialog(null);
    if (current.kind === 'decline') runRequest(current.id, declineRequest, 'Request declined.');
    else runRequest(current.id, endSharing, 'Sharing ended. The student was removed from your list.');
  }

  return <div className="wq-mentor-page">
    <PageHeader className="wq-mentor-header" title="Mentor home" subtitle="Answer sharing requests and open the students who shared with you." />
    {error && <Alert className="wq-mentor-alert" tone="danger">{error}</Alert>}
    <div className="wq-mentor-stats wq-g">
      <StatCard label="Pending requests" value={pending.length} hint="Waiting for your decision" />
      <StatCard label="Shared students" value={sharedStudents.length} hint="With active access" />
      <StatCard label="Announcements" value={`${newAnnouncements} new`} hint="For mentors" />
    </div>
    <div className="wq-mentor-home-grid wq-g">
      <Card className="wq-mentor-card" title="Sharing requests">
        {firstPending ? <div className="wq-mentor-stack">
          <Badge tone="warning">{pending.length} pending</Badge>
          <article className="wq-mentor-panel" data-request-id={firstPending.id}>
            <h3>{studentName(firstPending)}</h3><p>{getUser(firstPending.studentId)?.email}</p>
            <p>Proposed range: {rangeLabel(firstPending)}</p><p>Data: {scopeLabel(firstPending.scope)}</p><p>Goals: {goalNames(firstPending)}</p>
          </article>
          <p className="wq-mentor-note">You will see only the dates, data and goals the student approves. Activity details are not shown until you accept.</p>
          <div className="wq-mentor-actions"><Button onClick={() => runRequest(firstPending.id, acceptRequest, `Request accepted. ${studentName(firstPending)} is now in Shared students.`)}>Accept</Button><Button variant="secondary" onClick={() => setDialog({ kind: 'decline', id: firstPending.id })}>Decline</Button></div>
          {nextPending && <div className="wq-mentor-queue"><span><strong>{studentName(nextPending)}</strong> · {scopeLabel(nextPending.scope)} · {rangeLabel(nextPending)}</span><span>Next in queue</span></div>}
        </div> : <EmptyState message="No pending sharing requests. New requests appear here." />}
      </Card>
      <Card className="wq-mentor-card" title="Shared students">
        {sharedStudents.length ? <div className="wq-mentor-stack">
          <Input label="Search by student name" value={search} placeholder="Search..." onChange={event => setSearch(event.target.value)} />
          {matches.length ? <>
            <div className="wq-mentor-picker">{matches.map(row => <button type="button" key={row.request.id} className={row.request.id === selectedStudent?.request.id ? 'is-selected' : ''} onClick={() => setSelectedStudentId(row.request.id)}><strong>{row.student.mentorName}</strong><Badge tone="success">Accepted</Badge></button>)}</div>
            <p className="wq-mentor-note">Selected scope: {scopeLabel(selectedStudent.request.scope)} · {rangeLabel(selectedStudent.request)} · Goals: {goalNames(selectedStudent.request)}</p>
            <div className="wq-mentor-actions"><Button to={`/mentor/students/${selectedStudent.request.id}`}>Open Overview</Button><Button variant="secondary" onClick={() => setDialog({ kind: 'end', id: selectedStudent.request.id })}>End Sharing</Button></div>
          </> : <EmptyState message="No students match your search." />}
        </div> : <EmptyState message="No students are sharing with you yet. Accepted requests appear here." />}
      </Card>
    </div>
    <Card className="wq-mentor-card wq-mentor-announcements" title="Announcements">
      {announcements.length ? <div className="wq-mentor-announcement-grid wq-g"><div className="wq-mentor-picker">{announcements.map(item => <button type="button" key={item.id} className={item.id === selectedAnnouncement?.id ? 'is-selected' : ''} onClick={() => setSelectedAnnouncementId(item.id)}>{item.title}</button>)}</div><article className="wq-mentor-panel"><h3>{selectedAnnouncement.title}</h3><p>Audience: {selectedAnnouncement.audience === 'all' ? 'All users' : 'Mentors'} · {formatDateLong(selectedAnnouncement.date)}</p><p>{selectedAnnouncement.body || selectedAnnouncement.message || ''}</p></article></div>
        : <EmptyState message="No announcements for mentors." />}
    </Card>
    <ConfirmDialog open={Boolean(dialog)} tone="danger" title={dialog?.kind === 'decline' ? 'Decline this request?' : 'End sharing?'}
      message={dialog?.kind === 'decline' ? 'The student is told the request was declined.' : `${studentName(sharedStudents.find(row => row.request.id === dialog?.id)?.request)} will no longer share their data with you.`}
      confirmLabel={dialog?.kind === 'decline' ? 'Decline Request' : 'End Sharing'} cancelLabel="Cancel" onCancel={() => setDialog(null)} onConfirm={confirmDialog} />
  </div>;
}
