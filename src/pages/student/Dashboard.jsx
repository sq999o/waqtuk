// Dashboard: totals, charts and goal progress for a day, week or month. Owner: Dev 1.
// Dashboard: totals, charts and goal progress for a day, week or month. Owner: Dev 1.
import { useEffect, useState } from 'react';
import { Button, Card, EmptyState, Icon, PageHeader, ProgressBar, SegmentedControl, StatCard } from '../../components/ui';
import { BarChart, DonutChart } from '../../components/charts';
import { useData } from '../../context/DataContext';
import { getPeriodRange, getPreviousRange, startOfWeek, endOfWeek, formatDuration } from '../../utils/time.js';
import { sumByCategory, totalMinutes, compare, topCategoryId, percentages } from '../../utils/stats.js';
import { goalSummary } from '../../utils/goals.js';
import ActivityFormModal from './activities/ActivityFormModal';
import './Dashboard.css';

export default function Dashboard() {
  const { currentUser, myActivities = [], myCategories = [], myGoals = [] } = useData();

  // period: 'day' | 'week' | 'month'. offset: 0 is the current period, -1 the one before it
  const [period, setPeriod] = useState('week');
  const [offset, setOffset] = useState(0);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    document.title = 'Dashboard · Waqtuk';
  }, []);

  // The shown period, the one to compare with, and their totals
  const range = getPeriodRange(period, offset);
  const previous = getPreviousRange(period, offset);

  const totals = sumByCategory(myActivities, range.from, range.to);
  const total = totalMinutes(myActivities, range.from, range.to);
  const previousTotal = totalMinutes(myActivities, previous.from, previous.to);
  const change = compare(total, previousTotal);

  // Greeting by the real hour of the day
  const hour = new Date().getHours();

  let greeting = 'Good evening';

  if (hour < 12) {
    greeting = 'Good morning';
  } else if (hour < 18) {
    greeting = 'Good afternoon';
  }

  const firstName = currentUser?.name?.split(' ')[0] || 'Student';

  // Goals of the week that contains the last day of the shown period
  const weekStart = startOfWeek(range.to);
  const weekEnd = endOfWeek(weekStart);

  const goals = myGoals.filter(g => g.weekStart === weekStart);
  const weekTotals = sumByCategory(myActivities, weekStart, weekEnd);
  const summary = goalSummary(goals, weekTotals);

  // Only categories that have time in this period are drawn
  const donutSegments = myCategories
    .filter(c => totals[c.id] > 0)
    .map(c => ({
      id: c.id,
      label: c.name,
      minutes: totals[c.id],
      color: c.color
    }));

  const barData = donutSegments.map(c => ({
    key: c.id,
    label: c.label,
    minutes: c.minutes
  }));

  const topId = topCategoryId(totals, myCategories);
  const topCategory = myCategories.find(c => c.id === topId);
  const topMinutes = totals[topId] || 0;

  // Same percentages as the donut legend, so the two numbers always match
  const shares = percentages(donutSegments.map(c => c.minutes));
  const topIndex = donutSegments.findIndex(c => c.id === topId);
  const topPercent = topIndex >= 0 ? shares[topIndex] : 0;

  const previousName =
    period === 'day' ? 'the previous day' :
    period === 'week' ? 'the previous week' :
    'the previous month';

  const difference = formatDuration(Math.abs(change.diffMinutes));
  const changeText = `${change.diffMinutes >= 0 ? '+' : '−'}${difference} vs ${previousName}`;

  return (
    <div className="wq-dashboard">
      <PageHeader
        title={`${greeting}, ${firstName}`}
        subtitle="Here is where your time went."
        actions={
          <Button
            iconLeft={<Icon name="plus" size={18} />}
            onClick={() => setFormOpen(true)}
          >
            Add Activity
          </Button>
        }
      />

      <div className="wq-dashboard-period">
        <SegmentedControl
          options={[
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' }
          ]}
          value={period}
          onChange={value => {
            setPeriod(value);
            setOffset(0);
          }}
        />

        <Button
          variant="ghost"
          aria-label="Previous period"
          onClick={() => setOffset(offset - 1)}
        >
          <Icon name="chevron-left" />
        </Button>

        <span>{range.label}</span>

        <Button
          variant="ghost"
          aria-label="Next period"
          disabled={offset === 0}
          onClick={() => setOffset(offset + 1)}
        >
          <Icon name="chevron-right" />
        </Button>
      </div>

      {total === 0 ? (
        <EmptyState
          title="No activities recorded"
          message="Nothing is logged for this period yet, so there is no comparison to show."
          action={
            <Button onClick={() => setFormOpen(true)}>
              Add Activity
            </Button>
          }
        />
      ) : (
        <>
          <div className="wq-g wq-dashboard-stats">
            <StatCard
              label="Total recorded time"
              value={formatDuration(total)}
              hint={changeText}
            />

            <StatCard
              label="Largest category"
              value={topCategory?.name || 'None'}
              hint={`${formatDuration(topMinutes)} · ${topPercent}%`}
            />

            <Card title="Goal progress">
              <p>{summary.onTrack} of {summary.total} on track</p>

              <ProgressBar
                value={summary.onTrack}
                max={summary.total}
                label="Goals on track"
              />

              <Button variant="ghost" to="/goals">
                View goals
              </Button>
            </Card>
          </div>

          <div className="wq-g wq-dashboard-charts">
            <Card title="Time distribution">
              <DonutChart
                segments={donutSegments}
                centerValue={formatDuration(total)}
                centerLabel="logged"
              />
            </Card>

            <Card title="Category totals">
              <BarChart
                data={barData}
                ariaLabel="Category totals"
              />
            </Card>
          </div>

          <Card title={`Compared with ${previousName}`}>
            <div className="wq-dashboard-comparison">
              <p>{changeText}</p>

              <div>
                <p>This period: {formatDuration(total)}</p>
                <p>Previous period: {formatDuration(previousTotal)}</p>
              </div>
            </div>
          </Card>
        </>
      )}

      <ActivityFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
      />
    </div>
  );
}