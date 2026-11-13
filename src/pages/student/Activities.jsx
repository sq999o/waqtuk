// Activities: the student's activity list with search, filters, add, edit and delete. Owner: Dev 1.
import { useEffect, useState } from 'react';
import { Button, Card, CategoryDot, ConfirmDialog, Icon, Input, PageHeader, Select, Table } from '../../components/ui';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { TODAY, getPeriodRange, formatDateLong, formatActivityRange } from '../../utils/time.js';
import ActivityFormModal from './activities/ActivityFormModal';
import './Activities.css';

// How many rows are shown at first and every time Show more is pressed
const PAGE_SIZE = 5;

export default function Activities() {
  const { myActivities = [], myCategories = [], deleteActivity } = useData();
  const toast = useToast();

  useEffect(() => {
    document.title = 'Activities · Waqtuk';
  }, []);

  // formOpen / editing: the add and edit dialog. removing: the activity waiting for delete confirmation
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Keep only the activities that match all three filters
  const filtered = myActivities.filter(a => {
    const date = a.start.slice(0, 10);

    // The search looks in the notes and in the category name
    const category = myCategories.find(c => c.id === a.categoryId);
    const text = search.toLowerCase();

    const matchesSearch =
      (a.notes || '').toLowerCase().includes(text) ||
      (category?.name || '').toLowerCase().includes(text);

    // An empty filter means "all"
    const matchesCategory =
      !categoryFilter || a.categoryId === categoryFilter;

    let matchesDate = true;

    if (dateFilter === 'today') {
      matchesDate = date === TODAY;
    }

    if (dateFilter === 'week' || dateFilter === 'month') {
      const range = getPeriodRange(dateFilter);
      matchesDate = date >= range.from && date <= range.to;
    }

    return matchesSearch && matchesCategory && matchesDate;
  });

  const visible = filtered.slice(0, visibleCount);

  function confirmDelete() {
    if (!removing) return;

    const res = deleteActivity(removing.id);

    if (!res.ok) return;

    toast.show('Activity deleted.');
    setRemoving(null);
  }

  // Table columns: header is the column title, render draws the cell
  const columns = [
    {
      key: 'date',
      header: 'Date',
      // 'Sat 7 Nov 2026' -> 'Sat 7 Nov'
      render: row => formatDateLong(row.start.slice(0, 10))
        .replace(/ \d{4}$/, '')
    },
    {
      key: 'time',
      header: 'Time',
      render: row => formatActivityRange(row.start, row.end)
    },
    {
      key: 'category',
      header: 'Category',
      render: row => {
        const category = myCategories.find(
          c => c.id === row.categoryId
        );

        return (
          <span className="wq-activities-category">
            <CategoryDot color={category?.color || 'var(--faint)'} />
            {category?.name || 'Unknown'}
          </span>
        );
      }
    },
    {
      key: 'notes',
      header: 'Notes',
      render: row => row.notes || '—'
    },
    {
      key: 'actions',
      header: 'Actions',
      render: row => (
        <div className="wq-activities-actions">
          <Button
            size="sm"
            variant="secondary"
            aria-label={`Edit ${row.notes || 'activity'}`}
            onClick={() => {
              setEditing(row);
              setFormOpen(true);
            }}
          >
            Edit
          </Button>

          <Button
            size="sm"
            variant="secondary"
            aria-label={`Delete ${row.notes || 'activity'}`}
            onClick={() => setRemoving(row)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="wq-activities">
      <PageHeader
        title="Activities"
        subtitle="Log what you did and when. Totals and goals update automatically."
        actions={
          <Button
            iconLeft={<Icon name="plus" size={18} />}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Add Activity
          </Button>
        }
      />

      <Card title="Activity list">
        <div className="wq-g wq-activities-filters">
          <Input
            label="Search"
            placeholder="Search notes..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
          />

          <Select
            label="Category"
            placeholder="All categories"
            value={categoryFilter}
            options={myCategories.map(c => ({
              value: c.id,
              label: c.name
            }))}
            onChange={e => {
              setCategoryFilter(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
          />

          <Select
            label="Date"
            placeholder="All dates"
            value={dateFilter}
            options={[
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'This week' },
              { value: 'month', label: 'This month' }
            ]}
            onChange={e => {
              setDateFilter(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
          />
        </div>

        <Table
          columns={columns}
          rows={visible}
          emptyText="No activities match your filters."
        />

        <div className="wq-activities-footer">
          <span>
            Showing {visible.length} of {filtered.length} activities
          </span>

          {visibleCount < filtered.length && (
            <Button
              variant="ghost"
              onClick={() => setVisibleCount(visibleCount + PAGE_SIZE)}
            >
              Show more
            </Button>
          )}
        </div>
      </Card>

      <ActivityFormModal
        open={formOpen}
        activity={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(removing)}
        tone="danger"
        title="Delete Activity?"
        message="This activity will be permanently removed. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setRemoving(null)}
      />
    </div>
  );
}