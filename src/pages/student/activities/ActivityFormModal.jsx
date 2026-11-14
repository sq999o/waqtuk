
import { useEffect, useState } from 'react';
import { Button, Input, Modal, Select, Textarea } from '../../../components/ui';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { TODAY } from '../../../utils/time.js';
import { MESSAGES } from '../../../utils/validators';
import './ActivityFormModal.css';

// '2026-11-4' -> '2026-11-04' and ' 2026-11-04 ' -> '2026-11-04'. Other texts stay as they are (the validator rejects them).
function cleanDate(text) {
  const value = text.trim();
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value);

  if (!match) return value;

  return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
}

// '9:00' -> '09:00'
function cleanTime(text) {
  const value = text.trim();
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);

  if (!match) return value;

  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

function emptyForm(defaultDate) {
  return {
    categoryId: '',
    startDate: defaultDate,
    startTime: '',
    endDate: defaultDate,
    endTime: '',
    notes: ''
  };
}

export default function ActivityFormModal({
  open,
  onClose,
  activity = null,
  defaultDate = TODAY
}) {
  const { myCategories = [], addActivity, updateActivity } = useData();
  const toast = useToast();

  const [form, setForm] = useState(emptyForm(defaultDate));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;

    setError('');

    if (activity) {
      setForm({
        categoryId: activity.categoryId,
        startDate: activity.start.slice(0, 10),
        startTime: activity.start.slice(11, 16),
        endDate: activity.end.slice(0, 10),
        endTime: activity.end.slice(11, 16),
        notes: activity.notes || ''
      });
    } else {
      setForm(emptyForm(defaultDate));
    }
  }, [open, activity, defaultDate]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm(old => ({
      ...old,
      [name]: value
    }));

    setError('');
  }

  function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      categoryId: form.categoryId,
      start: `${cleanDate(form.startDate)}T${cleanTime(form.startTime)}`,
      end: `${cleanDate(form.endDate)}T${cleanTime(form.endTime)}`,
      notes: form.notes
    };

    const res = activity
      ? updateActivity(activity.id, payload)
      : addActivity(payload);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    toast.show('Activity saved.');
    onClose();
  }

  const categoryError =
    error === MESSAGES.activityRequired ? error : '';

  const startError =
    error.startsWith(MESSAGES.activityOverlap) ||
    error === MESSAGES.activityFuture
      ? error
      : '';

  const endError =
    error === MESSAGES.activityEndBeforeStart ? error : '';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={activity ? 'Edit Activity' : 'Add Activity'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" form="wq-activity-form">
            Save Activity
          </Button>
        </>
      }
    >
      <form
        id="wq-activity-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <Select
          label="Category *"
          name="categoryId"
          placeholder="Select category"
          options={myCategories.map(c => ({
            value: c.id,
            label: c.name
          }))}
          value={form.categoryId}
          onChange={handleChange}
          error={categoryError}
        />

        <div className="wq-g wq-activity-form-row">
          <Input
            label="Start date *"
            name="startDate"
            placeholder="YYYY-MM-DD"
            value={form.startDate}
            onChange={handleChange}
            error={startError}
          />

          <Input
            label="Start time *"
            name="startTime"
            placeholder="HH:MM"
            value={form.startTime}
            onChange={handleChange}
          />
        </div>

        <div className="wq-g wq-activity-form-row">
          <Input
            label="End date *"
            name="endDate"
            placeholder="YYYY-MM-DD"
            value={form.endDate}
            onChange={handleChange}
          />

          <Input
            label="End time *"
            name="endTime"
            placeholder="HH:MM"
            value={form.endTime}
            onChange={handleChange}
            error={endError}
          />
        </div>

        <Textarea
          label="Notes (optional)"
          name="notes"
          placeholder="Add notes..."
          value={form.notes}
          onChange={handleChange}
        />
      </form>
    </Modal>
  );
}