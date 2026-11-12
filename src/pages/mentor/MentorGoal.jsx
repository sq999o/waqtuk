
import { useEffect, useId, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Icon,
  Modal,
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

const ACCESS_ERROR =
  'Permission withdrawn: you no longer have access to this goal.';

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

  const suggestionFormId = useId();
  const flagFormId = useId();

  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');

  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [suggestionText, setSuggestionText] = useState('');
  const [suggestionError, setSuggestionError] = useState('');

  const [flagOpen, setFlagOpen] = useState(false);
  const [flagText, setFlagText] = useState('');
  const [flagError, setFlagError] = useState('');

  // Find an accepted sharing request containing this goal.
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

  const goal = sharedData?.goals?.find(
    (item) => item.id === goalId
  );

  const hasAccess = Boolean(request && student && goal);

  const category = goal
    ? getCategory?.(goal.categoryId)
    : null;

  const categoryName =
    category?.name ?? goal?.categoryId ?? '';

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

  // Only this mentor's visible feedback on this goal.
  // Filter and sort create a new array.
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

  // Reset all local forms when navigating to another goal.
  useEffect(() => {
    setComment('');
    setCommentError('');
    setSuggestionOpen(false);
    setFlagOpen(false);
    setSuggestionText('');
    setFlagText('');
    setSuggestionError('');
    setFlagError('');
  }, [goalId]);

  // Reset suggestion form each time it opens.
  useEffect(() => {
    if (!suggestionOpen) return;

    setSuggestionText('');
    setSuggestionError('');
  }, [suggestionOpen]);

  // Reset flag form each time it opens.
  useEffect(() => {
    if (!flagOpen) return;

    setFlagText('');
    setFlagError('');
  }, [flagOpen]);

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

  function openSuggestion() {
    setSuggestionText('');
    setSuggestionError('');
    setSuggestionOpen(true);
  }

  function closeSuggestion() {
    setSuggestionOpen(false);
    setSuggestionError('');
  }

  function openFlag() {
    setFlagText('');
    setFlagError('');
    setFlagOpen(true);
  }

  function closeFlag() {
    setFlagOpen(false);
    setFlagError('');
  }

  function handleSendSuggestion(event) {
    event.preventDefault();

    if (!hasAccess) {
      setSuggestionError(ACCESS_ERROR);
      return;
    }

    const result = addFeedback({
      goalId,
      type: 'suggestion',
      text: suggestionText,
    });

    if (!result.ok) {
      setSuggestionError(result.error);
      return;
    }

    closeSuggestion();
    toast.show('Suggestion sent.');
  }

  function handleSubmitFlag(event) {
    event.preventDefault();

    if (!hasAccess) {
      setFlagError(ACCESS_ERROR);
      return;
    }

    const result = addFeedback({
      goalId,
      type: 'flag',
      text: flagText,
    });

    if (!result.ok) {
      setFlagError(result.error);
      return;
    }

    closeFlag();
    toast.show('Flag submitted.');
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
          {ACCESS_ERROR}
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
          <div className="wq-mentorgoal-guidance-content">
            <div className="wq-mentorgoal-guidance-buttons">
              <Button
                variant="primary"
                iconLeft={<Icon name="plus" />}
                onClick={openSuggestion}
              >
                Suggest Adjustment
              </Button>

              <Button
                variant="secondary"
                iconLeft={<Icon name="flag" />}
                onClick={openFlag}
              >
                Flag Imbalance
              </Button>
            </div>

            <Alert tone="info">
              Mentor feedback cannot change student records.
              Only the student can edit goals or activities.
            </Alert>

            <Alert tone="info">
              Comments, suggestions and flags appear on the
              student's Mentor feedback page.
            </Alert>
          </div>
        </Card>
      </div>

      {/* Suggest Adjustment modal */}
      <Modal
        open={suggestionOpen}
        title="Suggest adjustment"
        onClose={closeSuggestion}
        size="sm"
        className="wq-mentorgoal-suggestion-modal"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={closeSuggestion}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              form={suggestionFormId}
            >
              Send
            </Button>
          </>
        }
      >
        <form
          id={suggestionFormId}
          className="wq-mentorgoal-modal-form"
          onSubmit={handleSendSuggestion}
          noValidate
        >
          <Textarea
            label="Advice *"
            name="suggestion"
            value={suggestionText}
            onChange={(event) => {
              setSuggestionText(event.target.value);
              setSuggestionError('');
            }}
            placeholder="Write your advice..."
            rows={4}
            error={
              suggestionError === ACCESS_ERROR
                ? undefined
                : suggestionError
            }
          />

          {suggestionError === ACCESS_ERROR && (
            <Alert tone="danger">
              {suggestionError}
            </Alert>
          )}
        </form>
      </Modal>

      {/* Flag Imbalance modal */}
      <Modal
        open={flagOpen}
        title="Flag imbalance"
        onClose={closeFlag}
        size="sm"
        className="wq-mentorgoal-flag-modal"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={closeFlag}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              form={flagFormId}
            >
              Submit Flag
            </Button>
          </>
        }
      >
        <form
          id={flagFormId}
          className="wq-mentorgoal-modal-form"
          onSubmit={handleSubmitFlag}
          noValidate
        >
          <Textarea
            label="Explanation *"
            name="flag"
            value={flagText}
            onChange={(event) => {
              setFlagText(event.target.value);
              setFlagError('');
            }}
            placeholder="Explain the concern..."
            rows={4}
            error={
              flagError === ACCESS_ERROR
                ? undefined
                : flagError
            }
          />

          {flagError === ACCESS_ERROR && (
            <Alert tone="danger">
              {flagError}
            </Alert>
          )}
        </form>
      </Modal>
    </div>
  );
}
