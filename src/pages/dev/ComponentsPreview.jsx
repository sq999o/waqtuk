// ComponentsPreview: development-only gallery (/components) of every UI component and variant,
// in light and dark side by side, so components can be checked without the pages. Owner: Dev 2.
import { useEffect, useState } from 'react';
import {
  Alert, Badge, Button, Card, CategoryDot, Checkbox, ConfirmDialog, EmptyState, Icon, Input, Modal,
  PageHeader, ProgressBar, Radio, SegmentedControl, Select, StatCard, Table, Textarea, Toast,
} from '../../components/ui';
import { useTheme } from '../../context/ThemeContext';
import './ComponentsPreview.css';

const ICON_NAMES = ['dashboard', 'list', 'calendar', 'chart', 'target', 'tag', 'share', 'message', 'bell', 'user',
  'users', 'home', 'inbox', 'flag', 'log-out', 'clock', 'plus', 'chevron-left', 'chevron-right', 'chevron-down',
  'menu', 'x', 'sun', 'moon'];
const TONES = ['neutral', 'success', 'warning', 'danger', 'info'];
const CATEGORY_OPTIONS = [{ value: 'study', label: 'Study' }, { value: 'work', label: 'Work' }, { value: 'sleep', label: 'Sleep' }];
const VIEW_OPTIONS = [{ value: 'both', label: 'Both' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }];
const TABLE_COLUMNS = [
  { key: 'name', header: 'Name' },
  { key: 'hours', header: 'Hours', align: 'right' },
  { key: 'status', header: 'Status', hideOnSmall: true, render: (row) => <Badge tone={row.tone}>{row.status}</Badge> },
];
const TABLE_ROWS = [
  { id: 'r1', name: 'Study', hours: 12, status: 'Active', tone: 'success' },
  { id: 'r2', name: 'Work', hours: 6, status: 'Paused', tone: 'warning' },
];

function Section({ title, children }) {
  return (
    <Card title={title} className="wq-preview-section">
      <div className="wq-preview-row">{children}</div>
    </Card>
  );
}

// One full copy of the gallery. `id` keeps radio names and field ids unique per theme.
function Gallery({ id }) {
  // Every example field is controlled, so React has nothing to warn about.
  const [form, setForm] = useState({ email: 'bad', category: '', note: '' });
  const field = (key) => ({ value: form[key] ?? '', onChange: (e) => setForm({ ...form, [key]: e.target.value }) });
  const [checks, setChecks] = useState({ a: true, b: false });
  const check = (key) => ({ checked: checks[key], onChange: (e) => setChecks({ ...checks, [key]: e.target.checked }) });
  const [radio, setRadio] = useState('week');
  const [segment, setSegment] = useState('week');
  const [alertOpen, setAlertOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="wq-preview-gallery">
      <PageHeader title="Page title" subtitle="PageHeader with a subtitle and actions."
        actions={<><Button variant="secondary">Secondary</Button><Button iconLeft={<Icon name="plus" size={18} />}>Add</Button></>} />

      <Section title="Button">
        {['primary', 'secondary', 'ghost', 'danger'].map((variant) => (
          <Button key={variant} variant={variant}>{variant}</Button>
        ))}
        {['primary', 'secondary', 'ghost', 'danger'].map((variant) => (
          <Button key={`sm-${variant}`} variant={variant} size="sm">{variant} sm</Button>
        ))}
        <Button iconLeft={<Icon name="plus" size={18} />}>With icon</Button>
        <Button loading>Loading</Button>
        <Button disabled>Disabled</Button>
        <Button variant="secondary" to="/components">Link button</Button>
        <Button fullWidth variant="secondary">Full width</Button>
      </Section>

      <Section title="Input">
        <Input id={`${id}-in1`} label="Default" placeholder="Type here" {...field('text')} />
        <Input id={`${id}-in2`} label="Required" required placeholder="email@example.com" type="email" {...field('required')} />
        <Input id={`${id}-in3`} label="With hint" hint="A short hint under the field." {...field('hint')} />
        <Input id={`${id}-in4`} label="With error" error="Enter a valid email address." {...field('email')} />
        <Input id={`${id}-in5`} label="Disabled" value="Academic Mentor" disabled readOnly />
      </Section>

      <Section title="Select and Textarea">
        <Select id={`${id}-sel1`} label="Category" placeholder="Choose a category" options={CATEGORY_OPTIONS}
          {...field('category')} />
        <Select id={`${id}-sel2`} label="With error" placeholder="Choose a category" options={CATEGORY_OPTIONS}
          error="Choose a category." {...field('category2')} />
        <Select id={`${id}-sel3`} label="Disabled" options={CATEGORY_OPTIONS} value="study" disabled onChange={() => {}} />
        <Textarea id={`${id}-ta1`} label="Note" placeholder="Write a note" maxLength={200} hint={`${form.note.length}/200`}
          {...field('note')} />
        <Textarea id={`${id}-ta2`} label="With error" rows={2} error="Message is required." {...field('note2')} />
      </Section>

      <Section title="Checkbox and Radio">
        <div className="wq-preview-stack">
          <Checkbox label="Click to toggle" {...check('a')} />
          <Checkbox label="Unchecked" {...check('b')} />
          <Checkbox label="Disabled" checked disabled readOnly />
        </div>
        <div className="wq-preview-stack" role="radiogroup" aria-label="Period">
          {['day', 'week', 'month'].map((value) => (
            <Radio key={value} name={`${id}-period`} value={value} label={value} checked={radio === value}
              onChange={() => setRadio(value)} />
          ))}
          <Radio name={`${id}-period-off`} value="off" label="Disabled" disabled readOnly />
        </div>
      </Section>

      <Section title="Card">
        <Card padding="none" className="wq-preview-fill"><p className="wq-preview-note">padding none</p></Card>
        <Card title="padding md" action={<Button size="sm" variant="ghost">Action</Button>} className="wq-preview-fill">
          <p className="wq-preview-note">Card with a title and an action.</p>
        </Card>
        <Card title="padding lg" padding="lg" className="wq-preview-fill"><p className="wq-preview-note">Large padding.</p></Card>
      </Section>

      <Section title="Alert">
        <div className="wq-preview-stack wq-preview-fill">
          {['info', 'success', 'warning', 'danger'].map((tone) => (
            <Alert key={tone} tone={tone} title={tone}>This is the {tone} alert.</Alert>
          ))}
          {alertOpen
            ? <Alert tone="info" onClose={() => setAlertOpen(false)}>This alert can be closed.</Alert>
            : <Button size="sm" variant="secondary" onClick={() => setAlertOpen(true)}>Show alert again</Button>}
        </div>
      </Section>

      <Section title="Icon">
        <ul className="wq-preview-icons">
          {ICON_NAMES.map((name) => (
            <li key={name}><Icon name={name} /><span>{name}</span></li>
          ))}
        </ul>
      </Section>

      <Section title="Badge, CategoryDot and ProgressBar">
        {TONES.map((tone) => <Badge key={tone} tone={tone}>{tone}</Badge>)}
        {['#5B6CF0', '#2E9E6B', '#E0A030', '#C62828'].map((color) => <CategoryDot key={color} color={color} />)}
        <div className="wq-preview-stack wq-preview-fill">
          {['primary', 'success', 'warning', 'danger'].map((tone, i) => (
            <ProgressBar key={tone} tone={tone} value={25 * (i + 1)} label={`${tone} ${25 * (i + 1)}%`} />
          ))}
        </div>
      </Section>

      <Section title="StatCard and SegmentedControl">
        {TONES.map((tone) => <StatCard key={tone} label="Hours" value="12" hint={tone} tone={tone} />)}
        <SegmentedControl aria-label="Soft range" value={segment} onChange={setSegment}
          options={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]} />
        <SegmentedControl aria-label="Solid range" variant="solid" value={segment} onChange={setSegment}
          options={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]} />
      </Section>

      <Section title="Table and EmptyState">
        <div className="wq-preview-fill"><Table columns={TABLE_COLUMNS} rows={TABLE_ROWS} /></div>
        <div className="wq-preview-fill"><Table columns={TABLE_COLUMNS} rows={[]} emptyText="No rows yet." /></div>
        <div className="wq-preview-fill">
          <EmptyState title="Nothing here yet." message="EmptyState with a message and an action."
            action={<Button size="sm">Add one</Button>} />
        </div>
      </Section>

      <Section title="Toast">
        {/* Shown in place here; in the app ToastContext puts one at the bottom right. */}
        {['success', 'error', 'info'].map((tone) => (
          <Toast key={tone} tone={tone} className="wq-preview-toast" message={`Toast: ${tone}`} />
        ))}
      </Section>

      <Section title="Modal and ConfirmDialog">
        <Button variant="secondary" onClick={() => setModalOpen(true)}>Open modal</Button>
        <Button variant="danger" onClick={() => setConfirmOpen(true)}>Open confirm</Button>
        <Modal open={modalOpen} title="Modal title" onClose={() => setModalOpen(false)}
          footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setModalOpen(false)}>Save</Button></>}>
          <Input id={`${id}-modal-in`} label="Field inside a modal" placeholder="Focus starts here" {...field('modal')} />
        </Modal>
        <ConfirmDialog open={confirmOpen} tone="danger" title="Delete item?" message="This cannot be undone."
          confirmLabel="Delete" onConfirm={() => setConfirmOpen(false)} onCancel={() => setConfirmOpen(false)} />
      </Section>
    </div>
  );
}

export default function ComponentsPreview() {
  const [view, setView] = useState('both');
  // The page frame follows the app theme; each pane below forces its own.
  const { themeClass } = useTheme();

  useEffect(() => { document.title = 'Components · Waqtuk'; }, []);

  const themes = view === 'both' ? ['light', 'dark'] : [view];

  return (
    <div className={`${themeClass} wq-preview`}>
      <header className="wq-preview-top">
        <div>
          <h1>Components preview</h1>
          <p>Development only. Every component in every variant, light and dark.</p>
        </div>
        <SegmentedControl aria-label="Theme" options={VIEW_OPTIONS} value={view} onChange={setView} />
      </header>
      <div className={`wq-preview-panes ${themes.length === 2 ? 'is-both' : ''}`}>
        {themes.map((theme) => (
          <section key={theme} aria-label={`${theme} theme`}
            className={`wq-shell ${theme === 'dark' ? 'wq-dark' : ''} wq-preview-pane`}>
            <p className="wq-preview-pane-label">{theme}</p>
            <Gallery id={theme} />
          </section>
        ))}
      </div>
    </div>
  );
}
