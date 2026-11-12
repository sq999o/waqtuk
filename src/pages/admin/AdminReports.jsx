
import { useEffect, useState } from 'react';
import {
  Card,
  Input,
  Select,
  PageHeader,
} from '../../components/ui';
import { useData } from '../../context/DataContext';
import { formatDateShort } from '../../utils/time';
import './AdminReports.css';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'closed', label: 'Closed' },
];

const TYPE_LABELS = {
  comment: 'Mentor comment',
  suggestion: 'Mentor suggestion',
  flag: 'Mentor flag',
};

export default function AdminReports() {
  const {
    contentReports = [],
    feedback = [],
  } = useData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    document.title = 'Reported content · Waqtuk';
  }, []);

  // Build display records without modifying the original data.
  const reportsWithDetails = contentReports.map(
    (report, index) => {
      const feedbackItem = feedback.find(
        (item) => item.id === report.feedbackId
      );

      const typeLabel =
        TYPE_LABELS[feedbackItem?.type] ?? 'Mentor feedback';

      return {
        ...report,
        title: `Report ${index + 1}: ${typeLabel}`,
      };
    }
  );

  const normalizedSearch = search.trim().toLowerCase();

  const filteredReports = reportsWithDetails.filter(
    (report) => {
      const matchesStatus =
        statusFilter === 'pending'
          ? report.status === 'pending'
          : report.status === 'dismissed' ||
            report.status === 'removed';

      const matchesSearch =
        report.title.toLowerCase().includes(normalizedSearch) ||
        report.reason.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    }
  );

  // Automatically select the first visible report
  // if the previous selection is no longer in the list.
  const selectedReport =
    filteredReports.find(
      (report) => report.id === selectedId
    ) ?? filteredReports[0] ?? null;

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setSelectedId(null);
  }

  function handleStatusChange(event) {
    setStatusFilter(event.target.value);
    setSelectedId(null);
  }

  return (
    <div className="wq-adminreports">
      <PageHeader
        title="Reported content"
        subtitle="Review reports from students and record a decision."
      />

      <div className="wq-adminreports-grid wq-g">
        <Card
          title="Pending reports"
          className="wq-adminreports-list-card"
        >
          <div className="wq-adminreports-controls">
            <Input
              name="reportSearch"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search reports..."
            />

            <Select
              name="reportStatus"
              value={statusFilter}
              onChange={handleStatusChange}
              options={STATUS_OPTIONS}
            />
          </div>

          {filteredReports.length === 0 ? (
            <p className="wq-adminreports-empty">
              No reports found.
            </p>
          ) : (
            <div className="wq-adminreports-list">
              {filteredReports.map((report) => {
                const isSelected =
                  selectedReport?.id === report.id;

                return (
                  <button
                    key={report.id}
                    type="button"
                    className={[
                      'wq-adminreports-item',
                      isSelected
                        ? 'wq-adminreports-item--selected'
                        : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => setSelectedId(report.id)}
                    aria-pressed={isSelected}
                  >
                    <span className="wq-adminreports-item-title">
                      {report.title}
                    </span>

                    <span className="wq-adminreports-item-reason">
                      Reason: {report.reason}
                    </span>

                    <span className="wq-adminreports-item-date">
                      Submitted{' '}
                      {formatDateShort(report.date)}{' '}
                      {report.date?.slice(0, 4)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        <Card
          title="Report detail"
          className="wq-adminreports-detail-card"
        >
          {/* Report detail will be implemented next. */}
          <div className="wq-adminreports-detail-placeholder" />
        </Card>
      </div>
    </div>
  );
}
