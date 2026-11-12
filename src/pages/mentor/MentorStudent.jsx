
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Input,
  PageHeader,
  Select,
} from '../../components/ui';
import { useData } from '../../context/DataContext';
import { formatDateShort, formatHours } from '../../utils/time';
import './MentorStudent.css';

function formatApprovedRange(from, to) {
  if (!from || !to) return '';

  const fromYear = from.slice(0, 4);
  const toYear = to.slice(0, 4);

  if (fromYear === toYear) {
    return `${formatDateShort(from)} – ${formatDateShort(to)} ${toYear}`;
  }

  return `${formatDateShort(from)} ${fromYear} – ${formatDateShort(to)} ${toYear}`;
}

function formatGoalScope(goal, categories) {
  const category = categories.find(
    (item) => item.id === goal.categoryId
  );

  const name = category?.name ?? goal.categoryId;
  const direction =
    goal.direction === 'atLeast' ? 'at least' : 'at most';

  return `${name} (${direction} ${formatHours(goal.targetMinutes)})`;
}

function formatScope(scope, goals) {
  const parts = [];

  if (scope.includes('summary')) parts.push('Summary');
  if (scope.includes('reports')) parts.push('Reports');

  const goalNames = goals.map((goal) => ({
    ...goal,
  }));

  return { parts, goalNames };
}

export default function MentorStudent() {
  const { id: requestId } = useParams();
  const navigate = useNavigate();

  const {
    sharedStudents = [],
    getSharedData,
    categories = [],
  } = useData();

  const sharedEntry = sharedStudents.find(
    (entry) => entry.request.id === requestId
  );

  const request = sharedEntry?.request;

  const sharedData =
    request && typeof getSharedData === 'function'
      ? getSharedData(requestId)
      : null;

  const student = sharedData?.student;
  const activities = sharedData?.activities ?? [];
  const goals = sharedData?.goals ?? [];

  const hasAccess = Boolean(request && student);

  const [viewFrom, setViewFrom] = useState(request?.from ?? '');
  const [viewTo, setViewTo] = useState(request?.to ?? '');

  const [appliedRange, setAppliedRange] = useState({
    from: request?.from ?? '',
    to: request?.to ?? '',
  });

  const [rangeError, setRangeError] = useState('');

  // Reset date fields whenever the sharing request changes.
  useEffect(() => {
    setViewFrom(request?.from ?? '');
    setViewTo(request?.to ?? '');

    setAppliedRange({
      from: request?.from ?? '',
      to: request?.to ?? '',
    });

    setRangeError('');
  }, [requestId, request?.from, request?.to]);

  useEffect(() => {
    document.title = hasAccess
      ? `${student.mentorName} · Waqtuk`
      : 'Shared student · Waqtuk';
  }, [hasAccess, student?.mentorName]);

  const studentOptions = sharedStudents.map(
    ({ request: itemRequest, student: itemStudent }) => ({
      value: itemRequest.id,
      label: itemStudent.mentorName,
    })
  );

  function handleStudentChange(event) {
    const newRequestId = event.target.value;

    if (newRequestId) {
      navigate(`/mentor/students/${newRequestId}`);
    }
  }

  function handleApply() {
    if (!request) return;

    const valid =
      /^\d{4}-\d{2}-\d{2}$/.test(viewFrom) &&
      /^\d{4}-\d{2}-\d{2}$/.test(viewTo) &&
      viewFrom >= request.from &&
      viewTo <= request.to &&
      viewFrom <= viewTo;

    if (!valid) {
      setRangeError(
        'Selected dates must be within the approved range, and View from cannot be after View to.'
      );
      return;
    }

    setRangeError('');

    setAppliedRange({
      from: viewFrom,
      to: viewTo,
    });
  }

  // Activities have already been limited by the
  // sharing selector. Apply only the narrower view range.
  const visibleActivities = activities.filter(
    (activity) => {
      const date = activity.start.slice(0, 10);

      return (
        date >= appliedRange.from &&
        date <= appliedRange.to
      );
    }
  );

  const scopeItems = request
    ? formatScope(request.scope ?? [], goals)
    : { parts: [], goalNames: [] };

  const goalDescriptions = scopeItems.goalNames.map(
    (goal) => formatGoalScope(goal, categories)
  );

  const scopeDescription = [
    ...scopeItems.parts,
    ...goalDescriptions.map((description) => `goal ${description}`),
  ].join(', ');

  if (!hasAccess) {
    return (
      <div className="wq-mentorstudent">
        <Alert tone="danger">
          Access unavailable: sharing was ended or revoked by the student.
        </Alert>
      </div>
    );
  }

  return (
    <div className="wq-mentorstudent">
      <PageHeader
        title={student.mentorName}
        subtitle="Overview and weekly reports within the approved scope."
      />

      <Card className="wq-mentorstudent-access-card">
        <div className="wq-mentorstudent-fields wq-g">
          <Select
            label="Shared student"
            name="sharedStudent"
            value={requestId}
            onChange={handleStudentChange}
            options={studentOptions}
          />

          <div className="wq-mentorstudent-readonly-field">
            <span className="wq-mentorstudent-field-label">
              Approved range
            </span>

            <div className="wq-mentorstudent-readonly-value">
              {formatApprovedRange(request.from, request.to)}
            </div>
          </div>

          <Input
            label="View from"
            name="viewFrom"
            type="text"
            value={viewFrom}
            onChange={(event) => {
              setViewFrom(event.target.value);
              setRangeError('');
            }}
            placeholder="YYYY-MM-DD"
          />

          <Input
            label="View to"
            name="viewTo"
            type="text"
            value={viewTo}
            onChange={(event) => {
              setViewTo(event.target.value);
              setRangeError('');
            }}
            placeholder="YYYY-MM-DD"
          />

          <div className="wq-mentorstudent-apply">
            <Button onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>

        {rangeError && (
          <div className="wq-mentorstudent-range-error">
            <Alert tone="danger">
              {rangeError}
            </Alert>
          </div>
        )}

        <div className="wq-mentorstudent-scope">
          <Alert tone="info">
            Approved scope: {scopeDescription}. Private notes are hidden.
          </Alert>
        </div>
      </Card>

      {visibleActivities.length === 0 && (
        <Alert tone="info">
          No shared activity in the selected dates.
        </Alert>
      )}
    </div>
  );
}
