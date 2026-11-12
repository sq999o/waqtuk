// AdminCategories: the administrator adds, renames, deactivates and reactivates default categories. Owner: Dev 2.
import { useEffect, useState } from 'react';
import {
  Alert, Badge, Button, Card, CategoryDot, ConfirmDialog, Icon, Input, Modal, PageHeader, Table,
} from '../../components/ui';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import './AdminCategories.css';

export default function AdminCategories() {
  const { categories = [], addDefaultCategory, renameDefaultCategory, setCategoryActive } = useData();
  const toast = useToast();

  // form: null (closed) or { id, name, error }; id is null when adding.
  const [form, setForm] = useState(null);
  // toggling: null (closed) or the category whose status will change.
  const [toggling, setToggling] = useState(null);

  useEffect(() => { document.title = 'Default categories · Waqtuk'; }, []);

  const defaults = categories.filter((c) => c.type === 'default');

  function saveForm(event) {
    event.preventDefault();
    const result = form.id ? renameDefaultCategory(form.id, form.name) : addDefaultCategory(form.name);
    if (!result.ok) { setForm({ ...form, error: result.error }); return; }
    toast.show('Category saved.');
    setForm(null);
  }

  function confirmToggle() {
    const result = setCategoryActive(toggling.id, !toggling.active);
    if (!result.ok) toast.show(result.error, 'error');
    else toast.show(toggling.active ? 'Category deactivated.' : 'Category reactivated.');
    setToggling(null);
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (c) => <span className="wq-admin-categories-name"><CategoryDot color={c.color} />{c.name}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => <Badge tone={c.active ? 'success' : 'neutral'}>{c.active ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (c) => (
        <div className="wq-admin-categories-actions">
          <Button variant="secondary" size="sm" aria-label={`Rename ${c.name}`}
            onClick={() => setForm({ id: c.id, name: c.name, error: '' })}>Rename</Button>
          <Button variant="secondary" size="sm" aria-label={`${c.active ? 'Deactivate' : 'Reactivate'} ${c.name}`}
            onClick={() => setToggling(c)}>{c.active ? 'Deactivate' : 'Reactivate'}</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="wq-admin-categories">
      <PageHeader
        title="Default categories"
        subtitle="Categories every student can use."
        actions={<Button iconLeft={<Icon name="plus" size={18} />}
          onClick={() => setForm({ id: null, name: '', error: '' })}>Add Category</Button>}
      />

      <Card title="Default category list">
        <Table columns={columns} rows={defaults} emptyText="No default categories yet." />
      </Card>

      <Modal
        open={form !== null}
        title={form?.id ? 'Rename category' : 'Add category'}
        onClose={() => setForm(null)}
        size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setForm(null)}>Cancel</Button>
          <Button type="submit" form="wq-default-category-form">Save</Button>
        </>}
      >
        {form && (
          <form id="wq-default-category-form" className="wq-admin-categories-form" onSubmit={saveForm} noValidate>
            <Input label="Category name" required placeholder="Enter category name" value={form.name}
              error={form.error} onChange={(e) => setForm({ ...form, name: e.target.value, error: '' })} />
            <Alert tone="info">
              Inactive categories stay attached to existing records but cannot be chosen for new activities or goals.
            </Alert>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={toggling !== null}
        tone={toggling?.active ? 'danger' : 'default'}
        title={toggling ? `${toggling.active ? 'Deactivate' : 'Reactivate'} "${toggling.name}"?` : ''}
        message={toggling?.active
          ? 'Existing records keep this category. It cannot be chosen for new activities or goals.'
          : 'The category becomes selectable again for new activities and goals.'}
        confirmLabel={toggling?.active ? 'Deactivate' : 'Reactivate'}
        onConfirm={confirmToggle}
        onCancel={() => setToggling(null)}
      />
    </div>
  );
}
