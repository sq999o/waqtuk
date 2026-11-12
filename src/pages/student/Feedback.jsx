
import { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Card,
  PageHeader,
  SegmentedControl,
} from '../../components/ui';
import { useData } from '../../context/DataContext';
import { formatDateShort } from '../../utils/time';
import './Feedback.css';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'comment', label: 'Comments' },
  { value: 'suggestion', label: 'Suggestions' },
  { value: 'flag', label: 'Flags' },
];

const TYPE_CONFIG = {
  comment: {
    label: 'Comment',
    tone: 'info',
  },
  suggestion: {
    label: 'Suggestion',
    tone: 'warning',
  },
  flag: {
    label: 'Flag',
    tone: 'danger',
  },
};

export default function Feedback() {
  const {
    myFeedback = [],
    getUser,
  } = useData();

  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    document.title = 'Mentor feedback · Waqtuk';
  }, []);

  // myFeedback is already sorted newest first
  // and excludes removed feedback.
  const filteredFeedback = myFeedback.filter(
    (item) =>
      filter === 'all' || item.type === filter
  );

  // Keep the first available item selected.
  const selectedItem =
    filteredFeedback.find(
      (item) => item.id === selectedId
    ) ?? filteredFeedback[0] ?? null;

  function handleFilterChange(value) {
    setFilter(value);
    setSelectedId(null);
  }

  function handleSelect(item) {
    setSelectedId(item.id);
  }

  function handleRowKeyDown(event, item) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelect(item);
    }
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
                  TYPE_CONFIG[item.type] ??
                  TYPE_CONFIG.comment;

                const mentor = getUser?.(
                  item.mentorId
                );

                const isSelected =
                  selectedItem?.id === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={[
                      'wq-feedback-row',
                      isSelected
                        ? 'wq-feedback-row--selected'
                        : '',
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
                        {mentor?.name ?? 'Mentor'}
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
          {/* Detail panel will be implemented next. */}
          <div className="wq-feedback-detail-placeholder" />
        </Card>
      </div>
    </div>
  );
}
