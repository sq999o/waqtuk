// AdminAnnouncements: the administrator writes, publishes and unpublishes announcements. Owner: Dev 2.
import { useEffect, useState } from 'react';
import {
  Alert, Badge, Button, Card, ConfirmDialog, Input, PageHeader, Select, Table, Textarea,
} from '../../components/ui';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { MESSAGES } from '../../utils/validators';
import './AdminAnnouncements.css';

const AUDIENCE_OPTIONS = [
  { value: 'students', label: 'Students' },
  { value: 'mentors', label: 'Mentors' },
  { value: 'all', label: 'All users' },
];
const AUDIENCE_LABELS = Object.fromEntries(AUDIENCE_OPTIONS.map((o) => [o.value, o.label]));

const STATUS = {
  draft: { label: 'Draft', tone: 'neutral' },
  published: { label: 'Published', tone: 'success' },
  unpublished: { label: 'Unpublished', tone: 'warning' },
};

const EMPTY_FORM = { id: null, title: '', body: '', audience: 'students' };

// Show each validation message under the field it belongs to.
function fieldOf(error) {
  if (error === MESSAGES.announcementTitleRequired) return 'title';
  if (error === MESSAGES.announcementMessageRequired) return 'body';
  if (error === MESSAGES.announcementInvalidAudience) return 'audience';
  return 'form';
}

export default function AdminAnnouncements() {
  const { announcements = [], saveAnnouncement, publishAnnouncement, unpublishAnnouncement } = useData();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null); // { field, text }
  const [unpublishing, setUnpublishing] = useState(null);

  useEffect(() => { document.title = 'Announcements · Waqtuk'; }, []);

  const rows = [...announcements].sort((a, b) => b.date.localeCompare(a.date));

  function change(field, value) {
    setForm({ ...form, [field]: value });
    if (error?.field === field) setError(null);
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setError(null);
  }

  // Save Draft keeps an edited item's status; Publish saves and then publishes it.
  function submit(publish) {
    const saved = saveAnnouncement(form);
    if (!saved.ok) { setError({ field: fieldOf(saved.error), text: saved.error }); return; }
    if (publish) {
      const published = publishAnnouncement(saved.id);
      if (!published.ok) { setError({ field: 'form', text: published.error }); return; }
    }
    toast.show(publish ? 'Announcement published.' : MESSAGES.announcementSaved);
    resetForm();
  }

  function runRowAction(action, id, success) {
    const result = action(id);
    toast.show(result.ok ? success : result.error, result.ok ? 'success' : 'error');
  }

  function confirmUnpublish() {
    runRowAction(unpublishAnnouncement, unpublishing.id, 'Announcement unpublished.');
    setUnpublishing(null);
  }

  const columns = [
    { key: 'title', header: 'Title', render: (a) => <strong>{a.title}</strong> },
    { key: 'audience', header: 'Audience', hideOnSmall: true, render: (a) => AUDIENCE_LABELS[a.audience] },
    {
      key: 'status',
      header: 'Status',
      render: (a) => <Badge tone={STATUS[a.status]?.tone}>{STATUS[a.status]?.label}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (a) => (
        <div className="wq-admin-announcements-actions">
          <Button variant="secondary" size="sm" aria-label={`Edit ${a.title}`}
            onClick={() => { setForm({ id: a.id, title: a.title, body: a.body, audience: a.audience }); setError(null); }}>
            Edit
          </Button>
          {a.status === 'draft' && (
            <Button variant="secondary" size="sm" aria-label={`Publish draft ${a.title}`}
              onClick={() => runRowAction(publishAnnouncement, a.id, 'Announcement published.')}>Publish Draft</Button>
          )}
          {a.status === 'published' && (
            <Button variant="secondary" size="sm" aria-label={`Unpublish ${a.title}`}
              onClick={() => setUnpublishing(a)}>Unpublish</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="wq-admin-announcements">
      <PageHeader title="Announcements" subtitle="Write, publish and unpublish messages for students and mentors." />

      <div className="wq-g wq-admin-announcements-grid">
        <Card title="Announcements">
          <Table columns={columns} rows={rows} emptyText="No announcements yet." />
          <Alert tone="info">
            Drafts and unpublished items are hidden from users. Only published items reach the chosen audience.
          </Alert>
        </Card>

        <Card title={form.id ? 'Edit announcement' : 'Announcement'}>
          <form className="wq-admin-announcements-form" noValidate
            onSubmit={(event) => { event.preventDefault(); submit(false); }}>
            <Input label="Title" required placeholder="Announcement title" value={form.title}
              error={error?.field === 'title' ? error.text : undefined}
              onChange={(e) => change('title', e.target.value)} />
            <Textarea label="Message *" rows={5} placeholder="Write the message..." value={form.body}
              error={error?.field === 'body' ? error.text : undefined}
              onChange={(e) => change('body', e.target.value)} />
            <Select label="Audience *" options={AUDIENCE_OPTIONS} value={form.audience}
              error={error?.field === 'audience' ? error.text : undefined}
              onChange={(e) => change('audience', e.target.value)} />
            {error?.field === 'form' && <Alert tone="danger">{error.text}</Alert>}
            <div className="wq-admin-announcements-buttons">
              <Button type="submit" variant="secondary">Save Draft</Button>
              <Button onClick={() => submit(true)}>Publish</Button>
              <Button variant="ghost" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </Card>
      </div>

      <ConfirmDialog
        open={unpublishing !== null}
        tone="danger"
        title="Unpublish announcement?"
        message="It will be hidden from users immediately."
        confirmLabel="Unpublish"
        onConfirm={confirmUnpublish}
        onCancel={() => setUnpublishing(null)}
      />
    </div>
  );
}
