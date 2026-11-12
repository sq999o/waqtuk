
import { useEffect, useState } from 'react';
import {
  Modal,
  Select,
  Input,
  Radio,
  Button,
  Alert,
} from '../../../components/ui';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { startOfWeek } from '../../../utils/time';
import './GoalFormModal.css';

function getInitialValues(goal, defaultWeekStart) {
  return {
    categoryId: goal?.categoryId ?? '',
    weekStart: goal?.weekStart ?? defaultWeekStart ?? '',
    targetHours: goal
      ? String(goal.targetMinutes / 60)
      : '',
    direction: goal?.direction ?? 'atLeast',
  };
}

export default function GoalFormModal({
  open,
  onClose,
  goal = null,
  defaultWeekStart,
}) {
  const {
    myCategories = [],
    addGoal,
    updateGoal,
  } = useData();

  const toast = useToast();

  const [values, setValues] = useState(() =>
    getInitialValues(goal, defaultWeekStart)
  );
  const [error, setError] = useState('');

  // Reset whenever the modal opens or switches goals.
  useEffect(() => {
    if (!open) return;

    setValues(getInitialValues(goal, defaultWeekStart));
    setError('');
  }, [open, goal, defaultWeekStart]);

  const categoryOptions = myCategories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  function updateField(field, value) {
    setValues((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (error) setError('');
  }

  function handleSave(event) {
    event.preventDefault();

    const rawDate = values.weekStart.trim();

    // Only normalize a complete ISO date.
    // Invalid input is left for the action validator.
    const normalizedWeekStart =
      /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
        ? startOfWeek(rawDate)
        : rawDate;

    const hours = values.targetHours.trim();

    const payload = {
      categoryId: values.categoryId,
      weekStart: normalizedWeekStart,
      targetMinutes:
        hours === '' ? '' : Number(hours) * 60,
      direction: values.direction,
    };

    const result = goal
      ? updateGoal(goal.id, payload)
      : addGoal(payload);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    toast.show('Goal saved.');
    onClose();
  }

  return (
    <Modal
      open={open}
      title={goal ? 'Edit goal' : 'Add goal'}
      onClose={onClose}
      className="wq-goalform-modal"
      footer={
        <>
          <Button
            type="submit"
            form="wq-goalform-form"
          >
            Save Goal
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
        </>
      }
    >
      <form
        id="wq-goalform-form"
        className="wq-goalform-form"
        onSubmit={handleSave}
        noValidate
      >
        {error && (
          <Alert tone="danger">
            {error}
          </Alert>
        )}

        <Select
          label="Category *"
          name="categoryId"
          value={values.categoryId}
          onChange={(event) =>
            updateField('categoryId', event.target.value)
          }
          options={categoryOptions}
          placeholder="Select category"
        />

        <Input
          label="Week start date *"
          name="weekStart"
          type="text"
          value={values.weekStart}
          onChange={(event) =>
            updateField('weekStart', event.target.value)
          }
          placeholder="YYYY-MM-DD"
        />

        <Input
          label="Target hours *"
          name="targetHours"
          type="number"
          min="0"
          max="168"
          step="any"
          value={values.targetHours}
          onChange={(event) =>
            updateField('targetHours', event.target.value)
          }
          placeholder="e.g. 10"
          hint="More than 0 and no more than 168 hours."
        />

        <fieldset className="wq-goalform-direction">
          <legend className="wq-goalform-legend">
            Direction *
          </legend>

          <div className="wq-goalform-radio-group">
            <Radio
              label="At least"
              name="direction"
              value="atLeast"
              checked={values.direction === 'atLeast'}
              onChange={() =>
                updateField('direction', 'atLeast')
              }
            />

            <Radio
              label="At most"
              name="direction"
              value="atMost"
              checked={values.direction === 'atMost'}
              onChange={() =>
                updateField('direction', 'atMost')
              }
            />
          </div>
        </fieldset>

        <p className="wq-goalform-tip">
          Tip: 56 hours of sleep in a week equals 8 hours a day.
        </p>
      </form>
    </Modal>
  );
}
