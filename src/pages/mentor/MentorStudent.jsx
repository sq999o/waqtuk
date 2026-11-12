
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  CategoryDot,
  PageHeader,
  ProgressBar,
  Select,
  Input,
  Table,
} from '../../components/ui';
import { DonutChart } from '../../components/charts';
import { useData } from '../../context/DataContext';
import {
  formatDateShort,
  formatDuration,
  formatHours,
  endOfWeek,
} from '../../utils/time';
import {
  sumByCategory,
  totalMinutes,
  percentages,
} from '../../utils/stats';
import {
  goalProgress,
  goalMessage,
} from '../../utils/goals';
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

function formatGoalScope(goal, getCategory) {
  const category = getCategory?.(goal.categoryId);
  const name = category?.name ?? goal.categoryId;
  const direction =
    goal.direction === 'atLeast' ? 'at least' : 'at most';

  return `${name} (${direction} ${formatHours(goal.targetMinutes)})`;
}

function progressTone(status) {
  if (status === 'reached') return 'success';
  if (status === 'exceeded') return 'danger';
  return 'primary';
}

export default function MentorStudent() {
  const { id: requestId } = useParams();
  const navigate = useNavigate();

  const {
    sharedStudents = [],
    getSharedData,
    getCategory,
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

  // These activities have already been restricted
  // to the approved dates by getSharedData().
  const visibleActivities = activities.filter((activity) => {
    const date = activity.start.slice(0, 10);

    return (
      date >= appliedRange.from &&
      date <= appliedRange.to
    );
  });

  const scope = request?.scope ?? [];
  const showSummary = scope.includes('summary');

  const scopeParts = [];

  if (scope.includes('summary')) scopeParts.push('Summary');
  if (scope.includes('reports')) scopeParts.push('Reports');

  goals.forEach((goal) => {
    scopeParts.push(`goal ${formatGoalScope(goal, getCategory)}`);
  });

  const scopeDescription = scopeParts.join(', ');

  // Category totals for the applied date range.
  const totalsByCategory = sumByCategory(
    activities,
    appliedRange.from,
    appliedRange.to
  );

  const total = totalMinutes(
    activities,
    appliedRange.from,
    appliedRange.to
  );

  const categoryTotals = Object.entries(totalsByCategory)
    .filter(([, minutes]) => minutes > 0)
    .map(([categoryId, minutes]) => {
      const category = getCategory?.(categoryId);

      return {
        id: categoryId,
        name: category?.name ?? categoryId,
        color: category?.color,
        minutes,
      };
    });

  const shares = percentages(
    categoryTotals.map((item) => item.minutes)
  );

  const categoryRows = categoryTotals.map((item, index) => ({
    ...item,
    share: shares[index] ?? 0,
  }));

  const tableRows = [
    ...categoryRows,
    {
      id: 'total',
      name: 'Total',
      minutes: total,
      share: total > 0 ? 100 : 0,
      isTotal: true,
    },
  ];

  const tableColumns = [
    {
      key: 'name',
      header: 'Category',
      render: (row) =>
        row.isTotal ? (
          <strong>{row.name}</strong>
        ) : (
          <span className="wq-mentorstudent-category">
            <CategoryDot color={row.color} />
            <span>{row.name}</span>
          </span>
        ),
    },
    {
      key: 'minutes',
      header: 'Time',
      align: 'right',
      render: (row) =>
        row.isTotal ? (
          <strong>{formatDuration(row.minutes)}</strong>
        ) : (
          formatDuration(row.minutes)
        ),
    },
    {
      key: 'share',
      header: 'Share',
      align: 'right',
      render: (row) =>
        row.isTotal ? (
          <strong>{row.share}%</strong>
        ) : (
          `${row.share}%`
        ),
    },
  ];

  const donutSegments = categoryRows.map((item) => ({
    id: item.id,
    label: item.name,
    minutes: item.minutes,
    color: item.color,
  }));

  // Each shared goal uses its own week.
  // Never read activities outside getSharedData().
  const goalRows = goals.map((goal) => {
    const goalTotals = sumByCategory(
      activities,
      goal.weekStart,
      endOfWeek(goal.weekStart)
    );

    const logged = goalTotals[goal.categoryId] ?? 0;
    const progress = goalProgress(goal, logged);

    return {
      goal,
      logged,
      progress,
      name: getCategory?.(goal.categoryId)?.name ??
        goal.categoryId,
    };
  });

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

      <div className="wq-mentorstudent-summary-grid wq-g">
        {showSummary && (
          <>
            <Card
              title="Category totals"
              className="wq-mentorstudent-totals-card"
            >
              <Table
                columns={tableColumns}
                rows={tableRows}
                rowKey="id"
                emptyText="No shared activity in the selected dates."
              />
            </Card>

            <Card
              title="Time distribution"
              className="wq-mentorstudent-distribution-card"
            >
              <DonutChart
                segments={donutSegments}
                centerValue={formatDuration(total)}
                centerLabel="logged"
              />
            </Card>
          </>
        )}

        {goals.length > 0 && (
          <Card
            title="Shared goal progress"
            className="wq-mentorstudent-goals-card"
          >
            <div className="wq-mentorstudent-goals-list">
              {goalRows.map(({ goal, logged, progress, name }) => (
                <div
                  key={goal.id}
                  className="wq-mentorstudent-goal"
                >
                  <div className="wq-mentorstudent-goal-title">
                    {name} (
                    {goal.direction === 'atLeast'
                      ? 'at least'
                      : 'at most'}
                    {' '}
                    {formatHours(goal.targetMinutes)})
                  </div>

                  <ProgressBar
                    value={progress.logged}
                    max={progress.target}
                    tone={progressTone(progress.status)}
                    label={`${name} goal progress`}
                  />

                  <p className="wq-mentorstudent-goal-description">
                    Logged {formatHours(logged)} of{' '}
                    {formatHours(goal.targetMinutes)}
                    {' · '}
                    {goalMessage(goal, logged)}
                  </p>

                  <Button
                    variant="primary"
                    to={`/mentor/goals/${goal.id}`}
                  >
                    Give feedback on this goal
                  </Button>
                </div>
              ))}
            </div>

            <div className="wq-mentorstudent-goal-notice">
              <Alert tone="info">
                Private notes are hidden.
              </Alert>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
