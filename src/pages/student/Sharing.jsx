import { useEffect, useRef, useState } from 'react';
import { Alert, Badge, Button, Card, Checkbox, ConfirmDialog, EmptyState, Input, PageHeader, Select } from '../../components/ui';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { TODAY, formatDateLong, formatHours, startOfWeek } from '../../utils/time';
import { messages as M } from '../../utils/validators/account';
import './Sharing.css';

const scopeNames = { summary: 'Summary', reports: 'Reports' };
const statusNames = { pending: 'Pending', accepted: 'Accepted', declined: 'Declined', cancelled: 'Cancelled', revoked: 'Revoked', ended: 'Ended' };
const dateLabel = date => formatDateLong(date).replace(/ \d{4}$/, '');
const rangeLabel = (from, to) => from.slice(0, 4) === to.slice(0, 4)
  ? `${dateLabel(from)} – ${dateLabel(to)}` : `${formatDateLong(from)} – ${formatDateLong(to)}`;

export default function Sharing() {
  const { users, myRequests, myGoals, getCategory, sendRequest, cancelRequest, revokeAccess } = useData();
  const { show } = useToast();
  const [form, setForm] = useState(() => ({ mentorId: '', from: '', to: '', scope: ['summary', 'reports'],
    goalIds: myGoals.filter(g => g.weekStart === startOfWeek(TODAY) && g.categoryId === 'cat-study').slice(0, 1).map(g => g.id) }));
  const [notice, setNotice] = useState(null);
  const [dialog, setDialog] = useState(null);
  const noticeRef = useRef(null);
  useEffect(() => { if (notice?.tone === 'danger') noticeRef.current?.focus(); }, [notice]);
  const week = startOfWeek(form.from || TODAY);
  const weekGoals = myGoals.filter(goal => goal.weekStart === week);
  const selectedGoals = weekGoals.filter(goal => form.goalIds.includes(goal.id));
  const mentors = users.filter(user => user.role === 'mentor' && user.status === 'active');
  const mentorName = id => users.find(user => user.id === id)?.name || 'Unavailable mentor';
  const goalLabel = goal => `${getCategory(goal.categoryId)?.name || 'Unavailable category'} (${goal.direction === 'atLeast' ? 'at least' : 'at most'} ${formatHours(goal.targetMinutes)})`;
  const information = scope => scope.map(key => scopeNames[key]).join(', ') || 'None';
  const goalNames = ids => ids.map(id => { const goal = myGoals.find(g => g.id === id); return goal ? goalLabel(goal) : 'Unavailable goal'; }).join(', ') || 'None';
  const pendingFirst = [...myRequests].sort((a, b) => Number(b.status === 'pending') - Number(a.status === 'pending'));

  function change(field, value) {
    setForm(current => ({ ...current, [field]: value,
      ...(field === 'from' && startOfWeek(value || TODAY) !== startOfWeek(current.from || TODAY) ? { goalIds: [] } : {}) }));
    setNotice(null);
  }
  function toggle(field, value, checked) {
    setForm(current => ({ ...current, [field]: checked ? [...new Set([...current[field], value])] : current[field].filter(item => item !== value) }));
    setNotice(null);
  }
  function submit(event) {
    event.preventDefault();
    const result = sendRequest({ ...form, goalIds: selectedGoals.map(goal => goal.id) });
    if (!result.ok) { setNotice({ tone: 'danger', message: result.error }); return; }
    setNotice({ tone: 'success', message: M.sharingSent });
    show(M.sharingSent);
  }
  function review() {
    setNotice({ tone: 'info', message: `Mentor: ${form.mentorId ? mentorName(form.mentorId) : 'Not selected'}. Approved range: ${form.from && form.to ? rangeLabel(form.from, form.to) : 'Not selected'}. Information: ${information(form.scope)}. Goals: ${goalNames(selectedGoals.map(g => g.id))}.` });
  }
  function confirm() {
    const result = dialog.kind === 'cancel' ? cancelRequest(dialog.id) : revokeAccess(dialog.id);
    setDialog(null);
    setNotice(result.ok ? null : { tone: 'danger', message: result.error });
  }
  const target = myRequests.find(request => request.id === dialog?.id);
  const cancelling = dialog?.kind === 'cancel';

  return <div className="wq-sharing-page">
    <PageHeader className="wq-sharing-header" title="Sharing" subtitle="Choose what a mentor can see. You can stop sharing at any time." />
    <div className="wq-sharing-grid wq-g">
      <Card className="wq-sharing-card" title="New sharing request">
        <form className="wq-sharing-form" aria-label="New sharing request" onSubmit={submit} noValidate>
          {notice && <div ref={noticeRef} tabIndex={-1}><Alert className={`wq-sharing-alert wq-sharing-alert--${notice.tone}`} tone={notice.tone}>{notice.message}</Alert></div>}
          <Select id="sharing-mentor" label="Mentor *" name="mentorId" placeholder="Select mentor" value={form.mentorId}
            options={mentors.map(user => ({ value: user.id, label: user.name }))} onChange={event => change('mentorId', event.target.value)} />
          <div className="wq-sharing-dates wq-g">
            <Input id="sharing-from" name="from" label="Start date" type="date" required value={form.from} onChange={event => change('from', event.target.value)} />
            <Input id="sharing-to" name="to" label="End date" type="date" required value={form.to} onChange={event => change('to', event.target.value)} />
          </div>
          <fieldset className="wq-sharing-fields"><legend>Information to share</legend><div className="wq-sharing-scopes">
            {Object.entries(scopeNames).map(([value, label]) => <Checkbox key={value} name={value} label={label} checked={form.scope.includes(value)} onChange={event => toggle('scope', value, event.target.checked)} />)}
          </div></fieldset>
          <fieldset className="wq-sharing-fields"><legend>Goals to share</legend><div className="wq-sharing-goals">
            {weekGoals.length ? weekGoals.map(goal => <Checkbox key={goal.id} name={goal.id} label={goalLabel(goal)} checked={form.goalIds.includes(goal.id)} onChange={event => toggle('goalIds', goal.id, event.target.checked)} />)
              : <p className="wq-sharing-muted">No goals for this week.</p>}
          </div></fieldset>
          <Alert className="wq-sharing-alert" tone="info">Private notes always stay hidden from mentors.</Alert>
          <div className="wq-sharing-buttons"><Button variant="secondary" onClick={review}>Review Scope</Button><Button type="submit">Send Request</Button></div>
        </form>
      </Card>
      <Card className="wq-sharing-card" title="Existing access">
        <div className="wq-sharing-requests">
          {pendingFirst.length ? pendingFirst.map(request => <article key={request.id} className="wq-sharing-request" data-request-id={request.id}>
            <div className="wq-sharing-request-heading"><h3>{mentorName(request.mentorId)}</h3>
              <Badge tone={request.status === 'pending' ? 'warning' : request.status === 'accepted' ? 'success' : 'neutral'}>{statusNames[request.status]}</Badge></div>
            <p>Approved range: {rangeLabel(request.from, request.to)}</p>
            <p>Information: {information(request.scope)}</p><p>Goals: {goalNames(request.goalIds)}</p>
            {request.status === 'pending' && <Button variant="secondary" size="sm" onClick={() => setDialog({ id: request.id, kind: 'cancel' })}>Cancel Pending Request</Button>}
            {request.status === 'accepted' && <Button variant="secondary" size="sm" onClick={() => setDialog({ id: request.id, kind: 'revoke' })}>Revoke Access</Button>}
          </article>) : <EmptyState message="No sharing requests yet." />}
          <Alert className="wq-sharing-alert" tone="info">Changing the scope replaces all current access with a new pending request.</Alert>
        </div>
      </Card>
    </div>
    <ConfirmDialog open={Boolean(dialog)} tone="danger" title={cancelling ? 'Cancel pending request?' : 'Revoke access?'}
      message={cancelling ? `The request to ${mentorName(target?.mentorId)} will be withdrawn.` : `${mentorName(target?.mentorId)} will immediately lose access to your shared data.`}
      confirmLabel={cancelling ? 'Cancel Request' : 'Revoke Access'} cancelLabel={cancelling ? 'Keep Request' : 'Keep Access'} onCancel={() => setDialog(null)} onConfirm={confirm} />
  </div>;
}
