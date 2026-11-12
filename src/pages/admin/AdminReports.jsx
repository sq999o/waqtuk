
import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  ConfirmDialog,
  Input,
  PageHeader,
  Select,
  Textarea,
} from '../../components/ui';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
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

const ERROR_MESSAGES = {
  required: 'A decision reason is required.',
  handled:
    'Already handled: another administrator closed this report.',
  removed:
    'Content unavailable: it was already removed.',
};

export default function AdminReports() {
  const {
    contentReports = [],
    feedback = [],
    getUser,
    decideReport,
  } = useData();

  const toast = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedId, setSelectedId] = useState(null);

  const [decisionReason, setDecisionReason] = useState('');
  const [decisionError, setDecisionError] = useState('');
  const [removeOpen, setRemoveOpen] = useState(false);

  useEffect(() => {
    document.title = 'Reported content · Waqtuk';
  }, []);

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

  const selectedReport =
    filteredReports.find(
      (report) => report.id === selectedId
    ) ?? filteredReports[0] ?? null;

  const selectedFeedback = feedback.find(
    (item) => item.id === selectedReport?.feedbackId
  );

  const author = selectedFeedback
    ? getUser?.(selectedFeedback.mentorId)
    : null;

  const reporter = selectedReport
    ? getUser?.(selectedReport.reporterId)
    : null;

  const isClosed =
    selectedReport?.status === 'dismissed' ||
    selectedReport?.status === 'removed';

  // Reset the decision field when selecting another report.
  useEffect(() => {
    setDecisionReason('');
    setDecisionError('');
  }, [selectedReport?.id]);

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setSelectedId(null);
    setRemoveOpen(false);
  }

  function handleStatusChange(event) {
    setStatusFilter(event.target.value);
    setSelectedId(null);
    setDecisionError('');
    setRemoveOpen(false);
  }

  function handleSelectReport(report) {
    setSelectedId(report.id);
    setDecisionReason('');
    setDecisionError('');
    setRemoveOpen(false);
  }

  function handleDecisionError(error) {
    setDecisionError(error);
  }

  function handleDismiss() {
    if (!selectedReport || isClosed) return;

    const result = decideReport(
      selectedReport.id,
      'dismissed',
      decisionReason
    );

    if (!result.ok) {
      handleDecisionError(result.error);
      return;
    }

    setDecisionReason('');
    setDecisionError('');
    setSelectedId(null);

    toast.show('Decision recorded. Report closed.');
  }

  // Validate before showing the remove confirmation.
  function openRemove() {
    if (!selectedReport || isClosed) return;

    if (!decisionReason.trim()) {
      setDecisionError(ERROR_MESSAGES.required);
      return;
    }

    setDecisionError('');
    setRemoveOpen(true);
  }

  // Confirm removal using the existing moderation action.
  function handleConfirmRemove() {
    if (!selectedReport || isClosed) {
      setRemoveOpen(false);
      return;
    }

    const result = decideReport(
      selectedReport.id,
      'removed',
      decisionReason
    );

    if (!result.ok) {
      setRemoveOpen(false);
      setDecisionError(result.error);
      return;
    }

    setRemoveOpen(false);
    setDecisionReason('');
    setDecisionError('');
    setSelectedId(null);

    toast.show('Decision recorded. Report closed.');
  }

  function formatReportDate(date) {
    if (!date) return '';

    return `${formatDateShort(date)} ${date.slice(0, 4)}`;
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
                    onClick={() =>
                      handleSelectReport(report)
                    }
                    aria-pressed={isSelected}
                  >
                    <span className="wq-adminreports-item-title">
                      {report.title}
                    </span>

                    <span className="wq-adminreports-item-reason">
                      Reason: {report.reason}
                    </span>

                    <span className="wq-adminreports-item-date">
                      Submitted {formatReportDate(report.date)}
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
          {selectedReport ? (
            <div className="wq-adminreports-detail">
              <div className="wq-adminreports-detail-section">
                <h3 className="wq-adminreports-detail-heading">
                  Reported content
                </h3>

                <div className="wq-adminreports-content-box">
                  {selectedFeedback?.detail ??
                    selectedFeedback?.text ??
                    ''}
                </div>
              </div>

              <div className="wq-adminreports-detail-fields">
                <div className="wq-adminreports-detail-field">
                  <span className="wq-adminreports-field-label">
                    Reason
                  </span>
                  <span>{selectedReport.reason}</span>
                </div>

                <div className="wq-adminreports-detail-field">
                  <span className="wq-adminreports-field-label">
                    Details
                  </span>
                  <span>{selectedReport.details || '—'}</span>
                </div>

                <div className="wq-adminreports-detail-field">
                  <span className="wq-adminreports-field-label">
                    Author
                  </span>
                  <span>{author?.name ?? '—'}</span>
                </div>

                <div className="wq-adminreports-detail-field">
                  <span className="wq-adminreports-field-label">
                    Reporter
                  </span>
                  <span>{reporter?.mentorName ?? '—'}</span>
                </div>

                <div className="wq-adminreports-detail-field">
                  <span className="wq-adminreports-field-label">
                    Date
                  </span>
                  <span>{formatReportDate(selectedReport.date)}</span>
                </div>
              </div>

              {isClosed ? (
                <div className="wq-adminreports-closed-reason">
                  <span className="wq-adminreports-field-label">
                    Decision reason
                  </span>

                  <p>{selectedReport.decisionReason}</p>
                </div>
              ) : (
                <Textarea
                  label="Decision reason *"
                  name="decisionReason"
                  value={decisionReason}
                  onChange={(event) => {
                    setDecisionReason(event.target.value);
                    setDecisionError('');
                  }}
                  placeholder="Explain your decision..."
                  rows={3}
                  error={
                    decisionError === ERROR_MESSAGES.required
                      ? decisionError
                      : undefined
                  }
                />
              )}

              {decisionError === ERROR_MESSAGES.handled && (
                <Alert tone="warning">
                  {decisionError}
                </Alert>
              )}

              {decisionError === ERROR_MESSAGES.removed && (
                <Alert tone="danger">
                  {decisionError}
                </Alert>
              )}

              {decisionError &&
                !Object.values(ERROR_MESSAGES).includes(
                  decisionError
                ) && (
                  <Alert tone="danger">
                    {decisionError}
                  </Alert>
                )}

              <div className="wq-adminreports-detail-actions">
                <Button
                  variant="secondary"
                  disabled={isClosed}
                  onClick={handleDismiss}
                >
                  Dismiss Report
                </Button>

                <Button
                  variant="danger"
                  disabled={isClosed}
                  onClick={openRemove}
                >
                  Remove Content
                </Button>
              </div>

              <Alert tone="info">
                Removing content also closes other pending reports
                for the same content.
              </Alert>
            </div>
          ) : (
            <p className="wq-adminreports-empty">
              No reports found.
            </p>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={removeOpen}
        title="Remove this content?"
        message="The content is removed and other pending reports for it are closed."
        confirmLabel="Remove Content"
        cancelLabel="Cancel"
        tone="danger"
        onConfirm={handleConfirmRemove}
        onCancel={() => setRemoveOpen(false)}
      />
    </div>
  );
}
