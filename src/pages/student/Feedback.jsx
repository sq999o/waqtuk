
import { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Icon,
  PageHeader,
  SegmentedControl,
} from '../../components/ui';
import { useData } from '../../context/DataContext';
import {
  formatDateShort,
  formatDateLong,
  formatHours,
} from '../../utils/time';
import './Feedback.css';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'comment', label: 'Comments' },
  { value: 'suggestion', label: 'Suggestions' },
  { value: 'flag', label: 'Flags' },
];

const TYPE_CONFIG = {
  comment: { label: 'Comment', tone: 'info' },
  suggestion: { label: 'Suggestion', tone: 'warning' },
  flag: { label: 'Flag', tone: 'danger' },
};

const REPORT_STATUS_MESSAGES = {
  pending: 'Your report is pending review.',
  dismissed: 'Your report was reviewed and dismissed.',
  removed: 'Your report was reviewed and the content was removed.',
};

export default function Feedback() {
  const {
    myFeedback = [],
    myGoals = [],
    contentReports = [],
    currentUser,
    getUser,
    getCategory,
  } = useData();

  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    document.title = 'Mentor feedback · Waqtuk';
  }, []);

  // myFeedback is already sorted newest first
  // and excludes removed feedback.
  const filteredFeedback = myFeedback.filter(
    (item) =>
      filter === 'all' || item.type === filter
  );

  const selectedItem =
    filteredFeedback.find((item) => item.id === selectedId) ??
    filteredFeedback[0] ??
    null;

  const selectedGoal = myGoals.find(
    (goal) => goal.id === selectedItem?.goalId
  );

  const category = selectedGoal
    ? getCategory?.(selectedGoal.categoryId)
    : null;

  const mentor = selectedItem
    ? getUser?.(selectedItem.mentorId)
    : null;

  const selectedType = selectedItem
    ? TYPE_CONFIG[selectedItem.type] ?? TYPE_CONFIG.comment
    : null;

  // Find the current student's most recent report
  // for the selected feedback item.
  const selectedReport = contentReports
    .filter(
      (report) =>
        report.feedbackId === selectedItem?.id &&
        report.reporterId === currentUser?.id
    )
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  function handleFilterChange(value) {
    setFilter(value);
    setSelectedId(null);
    setReportOpen(false);
  }

  function handleSelect(item) {
    setSelectedId(item.id);
    setReportOpen(false);
  }

  function handleReportClick() {
    if (!selectedItem || selectedItem.reported) return;
    setReportOpen(true);
  }

  function handleRowKeyDown(event, item) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelect(item);
    }
  }

  function formatGoalWeek(date) {
    return formatDateLong(date).replace(/\s+\d{4}$/, '');
  }

  return (
    <div className="wq-feedback">
      <PageHeader
        title="Mentor feedback"
        subtitle="Comments, suggestions and flags from mentors you share with."
      />

      <div className="wq-feedback-grid wq-g">
        <Card
          title="Feedback"
          className="wq-feedback-list-card"
        >
          <div className="wq-feedback-filters">
            <SegmentedControl
              options={FILTER_OPTIONS}
              value={filter}
              onChange={handleFilterChange}
            />
          </div>

          {filteredFeedback.length === 0 ? (
            <Alert tone="info">
              No feedback yet. Mentor feedback will appear here.
            </Alert>
          ) : (
            <div className="wq-feedback-list">
              {filteredFeedback.map((item) => {
                const type =
                  TYPE_CONFIG[item.type] ?? TYPE_CONFIG.comment;

                const itemMentor = getUser?.(item.mentorId);
                const isSelected = selectedItem?.id === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={[
                      'wq-feedback-row',
                      isSelected ? 'wq-feedback-row--selected' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => handleSelect(item)}
                    onKeyDown={(event) =>
                      handleRowKeyDown(event, item)
                    }
                    aria-pressed={isSelected}
                  >
                    <span className="wq-feedback-row-top">
                      <Badge tone={type.tone}>
                        {type.label}
                      </Badge>

                      <span className="wq-feedback-mentor">
                        {itemMentor?.name ?? 'Mentor'}
                      </span>

                      <span className="wq-feedback-date">
                        {formatDateShort(item.date)}
                      </span>
                    </span>

                    <span className="wq-feedback-row-text">
                      {item.text}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        <Card
          title="Feedback detail"
          className="wq-feedback-detail-card"
        >
          {selectedItem ? (
            <div className="wq-feedback-detail">
              <div className="wq-feedback-detail-meta">
                <Badge tone={selectedType.tone}>
                  {selectedType.label}
                </Badge>

                <span className="wq-feedback-detail-author">
                  From {mentor?.name ?? 'Mentor'} ·{' '}
                  {formatDateShort(selectedItem.date)}{' '}
                  {selectedItem.date.slice(0, 4)}
                </span>
              </div>

              <div className="wq-feedback-detail-text">
                {selectedItem.detail ?? selectedItem.text}
              </div>

              {selectedGoal && (
                <p className="wq-feedback-related-goal">
                  Related goal:{' '}
                  {category?.name ?? selectedGoal.categoryId}
                  {' ('}
                  {selectedGoal.direction === 'atLeast'
                    ? 'at least'
                    : 'at most'}
                  {' '}
                  {formatHours(selectedGoal.targetMinutes)}
                  {'), week of '}
                  {formatGoalWeek(selectedGoal.weekStart)}
                </p>
              )}

              <p className="wq-feedback-advice-note">
                Advice never changes your records automatically.
                Update your goals yourself if you agree.
              </p>

              {selectedReport && (
                <Alert tone="info">
                  {REPORT_STATUS_MESSAGES[selectedReport.status] ??
                    'Your report has been submitted.'}
                </Alert>
              )}

              <div className="wq-feedback-detail-actions">
                <Button
                  variant="secondary"
                  iconLeft={<Icon name="flag" />}
                  disabled={selectedItem.reported === true}
                  onClick={handleReportClick}
                >
                  Report Content
                </Button>

                <Button
                  variant="primary"
                  to="/goals"
                >
                  Open Goals
                </Button>
              </div>
            </div>
          ) : (
            <Alert tone="info">
              No feedback yet. Mentor feedback will appear here.
            </Alert>
          )}
        </Card>
      </div>
    </div>
  );
}
