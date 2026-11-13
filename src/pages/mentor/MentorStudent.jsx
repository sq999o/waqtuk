
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
  TODAY,
  addDays,
  startOfWeek,
  endOfWeek,
  formatDateShort,
  formatDateLong,
  formatDuration,
  formatHours,
} from '../../utils/time';
import {
  sumByCategory,
  totalMinutes,
  percentages,
  topCategoryId,
} from '../../utils/stats';
import { goalProgress, goalMessage } from '../../utils/goals';
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

function shortWeekDate(date) {
  return formatDateLong(date).replace(/\s+\d{4}$/, '');
}

function makeWeeklyReports(from, to) {
  const currentWeek = startOfWeek(TODAY);

  return [0, -1, -2].map((offset) => {
    const weekStart = addDays(currentWeek, offset * 7);
    const weekEnd = endOfWeek(weekStart);

    const coveredFrom = from > weekStart ? from : weekStart;
    const coveredTo = to < weekEnd ? to : weekEnd;

    const covered = coveredFrom <= coveredTo;
    const fullWeek =
      covered &&
      coveredFrom === weekStart &&
      coveredTo === weekEnd;

    const title = `Week of ${shortWeekDate(weekStart)} (${
      fullWeek ? 'full week' : 'partial week'
    })`;

    return {
      id: weekStart,
      weekStart,
      weekEnd,
      covered,
      coveredFrom: covered ? coveredFrom : null,
      coveredTo: covered ? coveredTo : null,
      title,
      coveredLabel: covered
        ? `${formatDateShort(coveredFrom)} – ${formatDateShort(coveredTo)}`
        : 'Not in approved range',
    };
  });
}

export default function MentorStudent() {
  const { id: requestId } = useParams();
  const navigate = useNavigate();

  const {
    sharedStudents = [],
    getSharedData,
    getCategory,
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
  const [selectedWeek, setSelectedWeek] = useState(null);

  useEffect(() => {
    setViewFrom(request?.from ?? '');
    setViewTo(request?.to ?? '');

    setAppliedRange({
      from: request?.from ?? '',
      to: request?.to ?? '',
    });

    setRangeError('');
    setSelectedWeek(null);
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

  const visibleActivities = activities.filter((activity) => {
    const date = activity.start.slice(0, 10);

    return (
      date >= appliedRange.from &&
      date <= appliedRange.to
    );
  });

  const scope = request?.scope ?? [];
  const showSummary = scope.includes('summary');
  const showReports = scope.includes('reports');

  const scopeParts = [];

  if (showSummary) scopeParts.push('Summary');
  if (showReports) scopeParts.push('Reports');

  goals.forEach((goal) => {
    scopeParts.push(`goal ${formatGoalScope(goal, getCategory)}`);
  });

  // Join the final item with "and" for natural wording.
  const scopeDescription =
    scopeParts.length <= 1
      ? scopeParts.join('')
      : scopeParts.length === 2
        ? scopeParts.join(' and ')
        : `${scopeParts.slice(0, -1).join(', ')} and ${scopeParts.at(-1)}`;

  // Summary calculations use only approved activities.
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

  // Follow the category order supplied by useData(),
  // rather than the order of the logged activities.
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
    })
    .sort((a, b) => {
      const indexA = categories.findIndex(
        (category) => category.id === a.id
      );

      const indexB = categories.findIndex(
        (category) => category.id === b.id
      );

      return (
        (indexA === -1 ? Infinity : indexA) -
        (indexB === -1 ? Infinity : indexB)
      );
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
        row.isTotal
          ? <strong>{formatDuration(row.minutes)}</strong>
          : formatDuration(row.minutes),
    },
    {
      key: 'share',
      header: 'Share',
      align: 'right',
      render: (row) =>
        row.isTotal
          ? <strong>{row.share}%</strong>
          : `${row.share}%`,
    },
  ];

  const donutSegments = categoryRows.map((item) => ({
    id: item.id,
    label: item.name,
    minutes: item.minutes,
    color: item.color,
  }));

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

  // Weekly reports are limited to three weeks and
  // to the approved sharing range.
  const weeklyReports = request
    ? makeWeeklyReports(request.from, request.to)
    : [];

  const selectedReport =
    weeklyReports.find(
      (report) =>
        report.id === selectedWeek &&
        report.covered
    ) ??
    weeklyReports.find((report) => report.covered) ??
    null;

  const reportTotals = selectedReport
    ? sumByCategory(
        activities,
        selectedReport.coveredFrom,
        selectedReport.coveredTo
      )
    : {};

  const reportTotal = selectedReport
    ? totalMinutes(
        activities,
        selectedReport.coveredFrom,
        selectedReport.coveredTo
      )
    : 0;

  const topId = selectedReport
    ? topCategoryId(reportTotals, categories)
    : null;

  const topName = topId
    ? getCategory?.(topId)?.name ?? topId
    : '—';

  const reportGoals = selectedReport
    ? goals.filter(
        (goal) => goal.weekStart === selectedReport.weekStart
      )
    : [];

  const reportColumns = [
    {
      key: 'title',
      header: 'Report',
      render: (row) => (
        <span
          className={
            row.covered
              ? 'wq-mentorstudent-report-name'
              : 'wq-mentorstudent-report-unavailable'
          }
        >
          {row.title}
        </span>
      ),
    },
    {
      key: 'coveredLabel',
      header: 'Covered dates',
      render: (row) => (
        <span
          className={
            row.covered
              ? 'wq-mentorstudent-report-dates'
              : 'wq-mentorstudent-report-unavailable'
          }
        >
          {row.coveredLabel}
        </span>
      ),
    },
  ];

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
            onChange={(event) =>
              handleStudentChange(event)
            }
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
            <Card title="Category totals">
              <Table
                columns={tableColumns}
                rows={tableRows}
                rowKey="id"
                emptyText="No shared activity in the selected dates."
              />
            </Card>

            <Card title="Time distribution">
              <DonutChart
                segments={donutSegments}
                centerValue={formatDuration(total)}
                centerLabel="logged"
              />
            </Card>
          </>
        )}

        {goals.length > 0 && (
          <Card title="Shared goal progress">
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

      {showReports ? (
        <Card
          title="Weekly reports"
          className="wq-mentorstudent-reports-card"
        >
          <div className="wq-mentorstudent-reports-grid wq-g">
            <div className="wq-mentorstudent-reports-list">
              <Table
                columns={reportColumns}
                rows={weeklyReports}
                rowKey="id"
                onRowClick={(row) => {
                  if (row.covered) {
                    setSelectedWeek(row.id);
                  }
                }}
              />
            </div>

            <div className="wq-mentorstudent-report-detail">
              {selectedReport ? (
                <>
                  <h3 className="wq-mentorstudent-report-title">
                    {selectedReport.title}
                  </h3>

                  <p>
                    <strong>Total time:</strong>{' '}
                    {formatDuration(reportTotal)}
                  </p>

                  <p>
                    <strong>Top category:</strong>{' '}
                    {topName}
                  </p>

                  {reportGoals.map((goal) => {
                    const name =
                      getCategory?.(goal.categoryId)?.name ??
                      goal.categoryId;

                    const logged =
                      reportTotals[goal.categoryId] ?? 0;

                    return (
                      <p key={goal.id}>
                        <strong>Goal {name}:</strong>{' '}
                        {formatHours(logged)} /{' '}
                        {formatHours(goal.targetMinutes)}
                      </p>
                    );
                  })}
                </>
              ) : (
                <p className="wq-mentorstudent-report-unavailable">
                  Not in approved range
                </p>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <Alert tone="info">
          Weekly reports were not included in the approved scope.
        </Alert>
      )}
    </div>
  );
}
