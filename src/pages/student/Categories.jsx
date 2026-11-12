// Categories: read-only default categories and the student's own custom categories. Owner: Dev 2.
import { useEffect, useState } from 'react';
import {
  Alert, Badge, Button, Card, CategoryDot, ConfirmDialog, Icon, Input, Modal, PageHeader, Select, Table,
} from '../../components/ui';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import './Categories.css';

// "4 activities and 1 goal"
function usageText(activityCount, goalCount) {
  const parts = [];
  if (activityCount) parts.push(`${activityCount} ${activityCount === 1 ? 'activity' : 'activities'}`);
  if (goalCount) parts.push(`${goalCount} ${goalCount === 1 ? 'goal' : 'goals'}`);
  return parts.join(' and ');
}

function CategoryName({ category }) {
  return (
    <span className="wq-categories-name">
      <CategoryDot color={category.color} />
      {category.name}
    </span>
  );
}

export default function Categories() {
  const {
    myCategories = [], myActivities = [], myGoals = [], addCategory, renameCategory, deleteCategory,
  } = useData();
  const toast = useToast();

  // form: null (closed) or { id, name, error }; id is null when adding.
  const [form, setForm] = useState(null);
  // removing: null (closed) or { category, reassignToId, error }.
  const [removing, setRemoving] = useState(null);

  useEffect(() => { document.title = 'Categories · Waqtuk'; }, []);

  const defaults = myCategories.filter((c) => c.type === 'default');
  const custom = myCategories.filter((c) => c.type === 'custom');

  function saveForm(event) {
    event.preventDefault();
    const result = form.id ? renameCategory(form.id, form.name) : addCategory(form.name);
    if (!result.ok) { setForm({ ...form, error: result.error }); return; }
    toast.show(form.id ? 'Category renamed.' : 'Category added.');
    setForm(null);
  }

  function confirmDelete() {
    const result = deleteCategory(removing.category.id, removing.reassignToId || null);
    if (!result.ok) { setRemoving({ ...removing, error: result.error }); return; }
    toast.show('Category deleted.');
    setRemoving(null);
  }

  const usedBy = removing && {
    activities: myActivities.filter((a) => a.categoryId === removing.category.id).length,
    goals: myGoals.filter((g) => g.categoryId === removing.category.id).length,
  };
  const inUse = usedBy && (usedBy.activities > 0 || usedBy.goals > 0);
  const reassignOptions = removing
    ? myCategories.filter((c) => c.id !== removing.category.id).map((c) => ({ value: c.id, label: c.name }))
    : [];

  const columns = [
    { key: 'name', header: 'Name', render: (c) => <CategoryName category={c} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (c) => (
        <div className="wq-categories-actions">
          <Button variant="secondary" size="sm" aria-label={`Rename ${c.name}`}
            onClick={() => setForm({ id: c.id, name: c.name, error: '' })}>Rename</Button>
          <Button variant="secondary" size="sm" aria-label={`Delete ${c.name}`}
            onClick={() => setRemoving({ category: c, reassignToId: '', error: '' })}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="wq-categories">
      <PageHeader title="Categories" subtitle="Organise your time with default and custom categories." />

      <div className="wq-g wq-categories-grid">
        <Card title="Default categories">
          <p className="wq-categories-note">Provided by Waqtuk. You can use them but not change them.</p>
          <ul className="wq-categories-list">
            {defaults.map((c) => (
              <li key={c.id} className="wq-categories-item">
                <CategoryName category={c} />
                <Badge tone="neutral">Read-only</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Custom categories">
          <div>
            <Button size="sm" iconLeft={<Icon name="plus" size={18} />}
              onClick={() => setForm({ id: null, name: '', error: '' })}>Add Category</Button>
          </div>
          <Table columns={columns} rows={custom} emptyText="No custom categories yet." />
        </Card>
      </div>

      <Modal
        open={form !== null}
        title={form?.id ? 'Rename category' : 'Add category'}
        onClose={() => setForm(null)}
        size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setForm(null)}>Cancel</Button>
          <Button type="submit" form="wq-category-form">Save</Button>
        </>}
      >
        {form && (
          <form id="wq-category-form" onSubmit={saveForm} noValidate>
            <Input label="Category name" required placeholder="Enter category name" value={form.name}
              error={form.error} onChange={(e) => setForm({ ...form, name: e.target.value, error: '' })} />
          </form>
        )}
      </Modal>

      {removing && !inUse && (
        <ConfirmDialog
          open
          tone="danger"
          title={`Delete category "${removing.category.name}"?`}
          message={removing.error || 'Nothing uses this category. This cannot be undone.'}
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setRemoving(null)}
        />
      )}

      <Modal
        open={Boolean(removing && inUse)}
        title={removing ? `Delete category "${removing.category.name}"?` : ''}
        onClose={() => setRemoving(null)}
        size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setRemoving(null)}>Cancel</Button>
          <Button variant="danger" disabled={!removing?.reassignToId} onClick={confirmDelete}>Delete</Button>
        </>}
      >
        {removing && inUse && (
          <div className="wq-categories-delete">
            <p>This category is used by {usageText(usedBy.activities, usedBy.goals)}. Reassign them before deleting.</p>
            <Select label="Reassign to *" required placeholder="Select category" options={reassignOptions}
              value={removing.reassignToId}
              onChange={(e) => setRemoving({ ...removing, reassignToId: e.target.value, error: '' })} />
            {removing.error && <Alert tone="danger">{removing.error}</Alert>}
          </div>
        )}
      </Modal>
    </div>
  );
}
