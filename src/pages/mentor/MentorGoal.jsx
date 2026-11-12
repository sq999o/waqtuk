
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  PageHeader,
  ProgressBar,
  Textarea,
} from '../../components/ui';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import {
  endOfWeek,
  formatDateLong,
  formatDateShort,
  formatHours,
} from '../../utils/time';
import { sumByCategory } from '../../utils/stats';
import {
  goalProgress,
  goalMessage,
} from '../../utils/goals';
import './MentorGoal.css';

function formatApprovedRange(from, to) {
  if (!from || !to) return '';

  const startYear = from.slice(0, 4);
  const endYear = to.slice(0, 4);

  if (startYear === endYear) {
    return `${formatDateShort(from)} – ${formatDateShort(to)} ${endYear}`;
  }

  return `${formatDateShort(from)} ${startYear} – ${formatDateShort(to)} ${endYear}`;
}

function formatWeekRange(weekStart) {
  const weekEnd = endOfWeek(weekStart);

  const startLabel = formatDateLong(weekStart)
    .replace(/\s+\d{4}$/, '');

  const endLabel = formatDateLong(weekEnd)
    .replace(/\s+\d{4}$/, '');

  return `${startLabel} – ${endLabel}`;
}

function getProgressTone(status) {
  if (status === 'reached') return 'success';
  if (status === 'exceeded') return 'danger';
  return 'primary';
}

export default function MentorGoal() {
  const { id: goalId } = useParams();

const {
  sharedStudents = [],
  getSharedData,
  currentUser,
  feedback = [],
  getCategory,
  addFeedback,
} = useData();

  const toast = useToast();

  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');

  // Locate an accepted sharing request that includes this goal.
  const sharedEntry = sharedStudents.find(
    (item) => item.request.goalIds.includes(goalId)
  );

  const request = sharedEntry?.request;

  const sharedData =
    request && typeof getSharedData === 'function'
      ? getSharedData(request.id)
      : null;

  const student = sharedData?.student;
  const activities = sharedData?.activities ?? [];

  // Confirm that the goal is actually present
  // in the approved, filtered sharing data.
  const goal = sharedData?.goals?.find(
    (item) => item.id === goalId
  );

  const hasAccess = Boolean(request && student && goal);

  const category = goal
    ? getCategory?.(goal.categoryId)
    : null;

  const categoryName = category?.name ?? goal?.categoryId ?? '';

  const totals = goal
    ? sumByCategory(
        activities,
        goal.weekStart,
        endOfWeek(goal.weekStart)
      )
    : {};

  const logged = goal
    ? totals[goal.categoryId] ?? 0
    : 0;

  const progress = goal
    ? goalProgress(goal, logged)
    : null;

  // Only this mentor's visible feedback for this goal.
  // Sorting happens on a filtered copy, not the source.
  const discussion = feedback
    .filter(
      (item) =>
        item.goalId === goalId &&
        item.mentorId === currentUser?.id &&
        item.removed !== true
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  useEffect(() => {
    document.title = 'Goal feedback · Waqtuk';
  }, []);

  useEffect(() => {
    setComment('');
    setCommentError('');
  }, [goalId]);

  function handlePostComment() {
    if (!hasAccess) return;

    const result = addFeedback({
      goalId,
      type: 'comment',
      text: comment,
    });

    if (!result.ok) {
      setCommentError(result.error);
      return;
    }

    setComment('');
    setCommentError('');
    toast.show('Comment posted.');
  }

  const scopeParts = [];

  if (request?.scope?.includes('summary')) {
    scopeParts.push('Summary');
  }

  if (request?.scope?.includes('reports')) {
    scopeParts.push('Reports');
  }

  if (goal) {
    scopeParts.push(`goal ${categoryName}`);
  }

  if (!hasAccess) {
    return (
      <div className="wq-mentorgoal">
        <Alert tone="danger">
          Permission withdrawn: you no longer have access to this goal.
        </Alert>
      </div>
    );
  }

  return (
    <div className="wq-mentorgoal">
      <PageHeader
        title="Goal feedback"
        subtitle="Comment on a shared goal, suggest changes or flag a concern."
      />

      <Alert tone="info">
        {student.mentorName}
        {' · Approved period: '}
        {formatApprovedRange(request.from, request.to)}
        {' · Scope: '}
        {scopeParts.join(', ')}
      </Alert>

      <div className="wq-mentorgoal-grid wq-g">
        <Card
          title={`Shared goal: ${categoryName}`}
          className="wq-mentorgoal-shared-card"
        >
          <div className="wq-mentorgoal-shared-content">
            <p className="wq-mentorgoal-period">
              Approved reporting period:{' '}
              {formatWeekRange(goal.weekStart)}
            </p>

            <ProgressBar
              value={progress.logged}
              max={progress.target}
              tone={getProgressTone(progress.status)}
              label={`${categoryName} goal progress`}
            />

            <p className="wq-mentorgoal-progress-text">
              Logged {formatHours(logged)} of{' '}
              {formatHours(goal.targetMinutes)}
              {' · '}
              {goalMessage(goal, logged)}
            </p>

            <div className="wq-mentorgoal-discussion">
              <h3 className="wq-mentorgoal-section-title">
                Existing discussion
              </h3>

              <div className="wq-mentorgoal-discussion-list">
                {discussion.map((item) => (
                  <div
                    key={item.id}
                    className="wq-mentorgoal-discussion-item"
                  >
                    <span className="wq-mentorgoal-discussion-author">
                      {currentUser?.name ?? 'Mentor'}
                      {' ('}
                      {formatDateShort(item.date)}
                      {'): '}
                    </span>

                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="wq-mentorgoal-comment-form">
              <Textarea
                label="Comment *"
                name="comment"
                value={comment}
                onChange={(event) => {
                  setComment(event.target.value);
                  setCommentError('');
                }}
                placeholder="Write a comment..."
                rows={3}
                error={commentError}
              />

              <Button onClick={handlePostComment}>
                Post Comment
              </Button>
            </div>
          </div>
        </Card>

        <Card
          title="Guidance actions"
          className="wq-mentorgoal-guidance-card"
        >
          {/* Guidance actions will be implemented next. */}
          <div className="wq-mentorgoal-guidance-placeholder" />
        </Card>
      </div>
    </div>
  );
}
