// Calendar: a month grid with a day panel and an activity details panel. Owner: Dev 1.
// Calendar: a month grid with a dot on the days that have activities, a panel for the selected day
// and an "Activity details" panel. Owner: Dev 1.
import { useEffect, useState } from 'react';
import { Badge, Button, Card, CategoryDot, ConfirmDialog, EmptyState, Icon, PageHeader } from '../../components/ui';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import {
  TODAY, getPeriodRange, formatDateLong,
  formatTime, formatActivityRange,
  formatDuration, durationMinutes
} from '../../utils/time.js';
import ActivityFormModal from './activities/ActivityFormModal';
import './Calendar.css';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Calendar() {
  const { myActivities = [], myCategories = [], deleteActivity } = useData();
  const toast = useToast();

  useEffect(() => {
    document.title = 'Calendar · Waqtuk';
  }, []);

  // monthOffset: 0 is the month of TODAY, -1 the month before it
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(TODAY);
  // Keep only the id, so the details panel always shows the latest data after an edit
  const [detailsId, setDetailsId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);

  // The month grid: blank cells before day 1 (the week starts on Monday), then every day
  const month = getPeriodRange('month', monthOffset);
  const firstDay = new Date(month.from);

  const year = firstDay.getUTCFullYear();
  const monthIndex = firstDay.getUTCMonth();

  const blanks = (firstDay.getUTCDay() + 6) % 7;

  // Day 0 of the next month is the last day of this month
  const dayCount = new Date(
    Date.UTC(year, monthIndex + 1, 0)
  ).getUTCDate();

  const days = [];

  for (let day = 1; day <= dayCount; day++) {
    const date = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    days.push(date);
  }

  // Activities that start on the date, plus overnight ones that end on it
  function activitiesOn(date) {
    return myActivities
      .filter(a => {
        const startDate = a.start.slice(0, 10);
        const endDate = a.end.slice(0, 10);

        return startDate === date || endDate === date;
      })
      .sort((a, b) => a.start.localeCompare(b.start));
  }

  function hasActivities(date) {
    return activitiesOn(date).length > 0;
  }

  const dayActivities = activitiesOn(selectedDate);
  const detailsActivity = myActivities.find(a => a.id === detailsId);

  function confirmDelete() {
    if (!removing) return;

    const res = deleteActivity(removing.id);

    if (!res.ok) return;

    toast.show('Activity deleted.');

    if (detailsId === removing.id) {
      setDetailsId(null);
    }

    setRemoving(null);
  }

  const categoryOf = activity =>
    myCategories.find(c => c.id === activity.categoryId);

  // 'Sat 7 Nov 2026' -> 'Sat 7 Nov'
  function shortDate(date) {
    return formatDateLong(date).replace(/ \d{4}$/, '');
  }

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(activity) {
    setEditing(activity);
    setFormOpen(true);
  }

  const deleteMessage = removing
    ? `Delete "${categoryOf(removing)?.name || 'Unknown'} ${formatActivityRange(removing.start, removing.end)}" on ${shortDate(removing.start.slice(0, 10))}? This cannot be undone.`
    : '';

  return (
    <div className="wq-calendar">
      <PageHeader
        title="Calendar"
        subtitle="See which days have activities and open any day for details."
        actions={
          <Button
            iconLeft={<Icon name="plus" size={18} />}
            onClick={openAdd}
          >
            Add Activity
          </Button>
        }
      />

      <div className="wq-g wq-calendar-layout">
        <Card title="Activity calendar">
          <div className="wq-calendar-month">
            <Button
              variant="ghost"
              aria-label="Previous month"
              onClick={() => setMonthOffset(monthOffset - 1)}
            >
              <Icon name="chevron-left" />
            </Button>

            <span>{month.label}</span>

            <Button
              variant="ghost"
              aria-label="Next month"
              onClick={() => setMonthOffset(monthOffset + 1)}
            >
              <Icon name="chevron-right" />
            </Button>
          </div>

          <div className="wq-calendar-grid">
            {WEEKDAYS.map(day => (
              <div key={day} className="wq-calendar-weekday">
                {day}
              </div>
            ))}

            {Array.from({ length: blanks }).map((_, index) => (
              <div key={`blank-${index}`} />
            ))}

            {days.map(date => {
              const classes = [
                'wq-calendar-day',
                date === TODAY ? 'wq-calendar-day--today' : '',
                date === selectedDate ? 'wq-calendar-day--selected' : '',
                hasActivities(date) ? 'wq-calendar-day--has-dot' : ''
              ].filter(Boolean).join(' ');

              return (
                <button
                  key={date}
                  type="button"
                  className={classes}
                  aria-pressed={date === selectedDate}
                  onClick={() => {
                    setSelectedDate(date);
                    setDetailsId(null);
                  }}
                >
                  <span>{Number(date.slice(8, 10))}</span>

                  {hasActivities(date) && (
                    <span className="wq-calendar-dot" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="wq-calendar-legend">
            <span>
              <span className="wq-calendar-dot" />
              Day with activities
            </span>

            <span>Selected date</span>
          </div>
        </Card>

        <div className="wq-calendar-side">
          <Card title={formatDateLong(selectedDate)}>
            {dayActivities.length === 0 ? (
              <EmptyState
                message="No activities recorded on this day."
                action={
                  <Button onClick={openAdd}>
                    Add Activity
                  </Button>
                }
              />
            ) : (
              dayActivities.map(activity => {
                const category = categoryOf(activity);

                const overnight =
                  activity.start.slice(0, 10) !==
                  activity.end.slice(0, 10);

                return (
                  <div
                    key={activity.id}
                    className="wq-calendar-activity"
                    role="button"
                    tabIndex={0}
                    onClick={() => setDetailsId(activity.id)}
                    onKeyDown={event => {
                      if (event.key === 'Enter') setDetailsId(activity.id);
                    }}
                  >
                    <div className="wq-calendar-activity-title">
                      <CategoryDot color={category?.color} />
                      <strong>{category?.name || 'Unknown'}</strong>

                      {overnight && (
                        <Badge tone="neutral">Overnight</Badge>
                      )}
                    </div>

                    <p>
                      {formatTime(activity.start)} – {formatTime(activity.end)}
                      {' · '}
                      {formatDuration(
                        durationMinutes(activity.start, activity.end)
                      )}
                    </p>

                    <p>{activity.notes}</p>

                    <div className="wq-calendar-activity-actions">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={event => {
                          event.stopPropagation();
                          openEdit(activity);
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={event => {
                          event.stopPropagation();
                          setRemoving(activity);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </Card>

          {detailsActivity && (
            <Card title="Activity details">
              <p>
                Category: {categoryOf(detailsActivity)?.name || 'Unknown'}
              </p>

              <p>
                Start: {shortDate(detailsActivity.start.slice(0, 10))},
                {' '}{formatTime(detailsActivity.start)}
              </p>

              <p>
                End: {shortDate(detailsActivity.end.slice(0, 10))},
                {' '}{formatTime(detailsActivity.end)}
              </p>

              <p>
                Duration: {formatDuration(
                  durationMinutes(detailsActivity.start, detailsActivity.end)
                )}
              </p>

              <p>Notes: {detailsActivity.notes || '—'}</p>
            </Card>
          )}
        </div>
      </div>

      <ActivityFormModal
        open={formOpen}
        activity={editing}
        defaultDate={selectedDate}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(removing)}
        tone="danger"
        title="Delete Activity?"
        message={deleteMessage}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setRemoving(null)}
      />
    </div>
  );
}
