// AdminDashboard: platform usage totals for a date range, with quick links. Owner: Dev 1.

import { useEffect, useState } from 'react';
import { Button, Card, Input, PageHeader, StatCard } from '../../components/ui';
import { useData } from '../../context/DataContext';
import { TODAY, getPeriodRange } from '../../utils/time.js';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { usageFor } = useData();

  const initialRange = getPeriodRange('week');

  const [startDate, setStartDate] = useState(initialRange.from);
  const [endDate, setEndDate] = useState(initialRange.to);
  const [applied, setApplied] = useState(initialRange);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Administration dashboard · Waqtuk';
  }, []);

  function handleApply(event) {
    event.preventDefault();

    const validDate = date => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
      }

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

    if (
      startDate > TODAY ||
      (endDate > TODAY && endDate !== initialRange.to)
    ) {
      setError('Dates cannot be in the future.');
      return;
    }

    setApplied({
      from: startDate,
      to: endDate
    });

    setError('');
  }

  const usage = usageFor(applied.from, applied.to);

  const noActivity = Object.values(usage).every(n => n === 0);

  const stats = [
    { label: 'New students', value: usage.students },
    { label: 'New mentors', value: usage.mentors },
    { label: 'Activities', value: usage.activities },
    { label: 'Sharing requests', value: usage.requests },
    { label: 'Reports', value: usage.reports }
  ];

  return (
    <div className="wq-admin-dashboard">
      <PageHeader
        title="Administration dashboard"
        subtitle="Usage across the platform. Totals only, never private records."
      />

      <Card>
        <form
          className="wq-g wq-admin-dashboard-filters"
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

          <Button type="submit">
            Apply
          </Button>
        </form>
      </Card>

      <div className="wq-g wq-admin-dashboard-stats">
        {stats.map(stat => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            hint="in selected range"
          />
        ))}
      </div>

      <div id="usage">
        <Card title="Usage in selected range">
          <div className="wq-admin-dashboard-usage">
            {stats.map(stat => (
              <div
                key={stat.label}
                className="wq-admin-dashboard-usage-row"
              >
                <span>
                  {stat.label === 'Reports'
                    ? 'Moderation reports'
                    : stat.label}
                </span>

                <strong>{stat.value}</strong>
              </div>
            ))}

            {noActivity && (
              <p>No activity recorded in this range.</p>
            )}
          </div>
        </Card>
      </div>

      <Card title="Quick links">
        <div className="wq-admin-dashboard-links">
          <Button variant="secondary" to="/admin/users">
            Users
          </Button>

          <Button variant="secondary" to="/admin/categories">
            Default categories
          </Button>

          <Button variant="secondary" to="/admin/reports">
            Reported content
          </Button>

          <Button variant="secondary" to="/admin/announcements">
            Announcements
          </Button>
        </div>
      </Card>
    </div>
  );
}

