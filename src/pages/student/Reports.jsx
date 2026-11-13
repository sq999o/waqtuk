// Reports: totals, time distribution and weekly goals for any date range, with a print export. Owner: Dev 1.
import { useEffect, useState } from 'react';
import { Badge, Button, Card, CategoryDot, EmptyState, Input, PageHeader, Table } from '../../components/ui';
import { DonutChart } from '../../components/charts';
import { useData } from '../../context/DataContext';
import { TODAY, getPeriodRange, endOfWeek, formatDateLong, formatDuration, formatHours } from '../../utils/time.js';
import { sumByCategory, totalMinutes, percentages } from '../../utils/stats.js';
import { goalProgress, goalMessage } from '../../utils/goals.js';
import './Reports.css';

export default function Reports() {
  const { myActivities = [], myCategories = [], myGoals = [] } = useData();

  // The report starts with the current week
  const initialRange = getPeriodRange('week');

  // startDate / endDate: what is typed in the inputs. applied: the range the report really uses
  const [startDate, setStartDate] = useState(initialRange.from);
  const [endDate, setEndDate] = useState(initialRange.to);
  const [applied, setApplied] = useState(initialRange);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Reports · Waqtuk';
  }, []);

  function handleApply(event) {
    event.preventDefault();

    // 'YYYY-MM-DD' written correctly and a real calendar date
    const validDate = date => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;

      const d = new Date(date);

      return !Number.isNaN(d.getTime()) &&
        d.toISOString().slice(0, 10) === date;
    };

    if (!validDate(startDate) || !validDate(endDate)) {
      setError('Enter both dates as YYYY-MM-DD.');
      return;
    }

    if (endDate < startDate) {
      setError('End date must be on or after the start date.');
      return;
    }

    // The end of the default week (8 Nov) is after TODAY, but it must stay allowed
    if (startDate > TODAY || endDate > TODAY && endDate !== initialRange.to) {
      setError('Dates cannot be in the future.');
      return;
    }

    setApplied({ from: startDate, to: endDate });
    setError('');
  }

  const totals = sumByCategory(myActivities, applied.from, applied.to);
  const total = totalMinutes(myActivities, applied.from, applied.to);

  // Only categories with time are listed; the shares add up to exactly 100
  const activeCategories = myCategories.filter(c => totals[c.id] > 0);
  const shares = percentages(activeCategories.map(c => totals[c.id]));

  const rows = activeCategories.map((category, index) => ({
    id: category.id,
    name: category.name,
    color: category.color,
    minutes: totals[category.id],
    share: shares[index]
  }));

  const segments = rows.map(row => ({
    id: row.id,
    label: row.name,
    minutes: row.minutes,
    color: row.color
  }));

  // Goals whose week starts inside the range
  const goalRows = myGoals
    .filter(goal =>
      goal.weekStart >= applied.from &&
      goal.weekStart <= applied.to
    )
    .map(goal => {
      const category = myCategories.find(c => c.id === goal.categoryId);

      // The actual time is counted for the week of the goal, not for the whole range
      const weekTotals = sumByCategory(
        myActivities,
        goal.weekStart,
        endOfWeek(goal.weekStart)
      );

      const actual = weekTotals[goal.categoryId] || 0;
      const progress = goalProgress(goal, actual);
      const message = goalMessage(goal, actual);

      let tone = 'neutral';

      if (progress.status === 'reached') {
        tone = 'success';
      } else if (message.startsWith('Exceeded')) {
        tone = 'danger';
      }

      return {
        id: goal.id,
        category: category?.name || 'Unknown',
        direction: goal.direction === 'atLeast' ? 'at least' : 'at most',
        period: `Week of ${formatDateLong(goal.weekStart).replace(/ \d{4}$/, '')}`,
        target: formatHours(goal.targetMinutes),
        actual: formatHours(actual),
        message,
        tone
      };
    });

  // No PDF library: the browser print dialog is the export
  function handleExport() {
    window.print();
  }

  const categoryColumns = [
    {
      key: 'category',
      header: 'Category',
      render: row => row.id === 'total' ? (
        <strong>Total</strong>
      ) : (
        <span className="wq-reports-category">
          <CategoryDot color={row.color} />
          {row.name}
        </span>
      )
    },
    {
      key: 'time',
      header: 'Time',
      render: row => formatDuration(row.minutes)
    },
    {
      key: 'share',
      header: 'Share',
      render: row => `${row.share}%`
    }
  ];

  // The Total row is one more row at the end of the table
  const tableRows = [
    ...rows,
    {
      id: 'total',
      name: 'Total',
      minutes: total,
      share: 100
    }
  ];

  const goalColumns = [
    {
      key: 'goal',
      header: 'Goal',
      render: row => `${row.category} (${row.direction})`
    },
    {
      key: 'period',
      header: 'Goal period',
      render: row => row.period
    },
    {
      key: 'target',
      header: 'Target',
      render: row => row.target
    },
    {
      key: 'actual',
      header: 'Actual',
      render: row => row.actual
    },
    {
      key: 'result',
      header: 'Result',
      render: row => (
        <Badge tone={row.tone}>{row.message}</Badge>
      )
    }
  ];

  return (
    <div className="wq-reports">
      <PageHeader
        title="Reports"
        subtitle="Review totals and goals for any period, then export a PDF."
        actions={
          <div className="wq-reports-export">
            <Button
              variant="secondary"
              onClick={handleExport}
              disabled={total === 0}
            >
              Export PDF
            </Button>

            {total === 0 && (
              <span>Export is available once activities exist.</span>
            )}
          </div>
        }
      />

      <Card>
        <form
          className="wq-g wq-reports-filters"
          onSubmit={handleApply}
          noValidate
        >
          <Input
            label="Start date"
            placeholder="YYYY-MM-DD"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />

          <Input
            label="End date"
            placeholder="YYYY-MM-DD"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            error={error}
          />

          <Button type="submit">Apply</Button>
        </form>
      </Card>

      {total === 0 ? (
        <EmptyState message="No activities found for the selected range." />
      ) : (
        <>
          <div className="wq-g wq-reports-layout">
            <Card title="Category totals">
              <Table
                columns={categoryColumns}
                rows={tableRows}
              />
            </Card>

            <Card title="Time distribution">
              <DonutChart
                segments={segments}
                centerValue={formatDuration(total)}
                centerLabel="logged"
              />
            </Card>
          </div>

          <Card title="Weekly goals in selected range">
            {goalRows.length === 0 ? (
              <p>No goals in this range.</p>
            ) : (
              <Table
                columns={goalColumns}
                rows={goalRows}
              />
            )}
          </Card>
        </>
      )}
    </div>
  );
}
