
import { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CategoryDot,
  PageHeader,
  ProgressBar,
} from '../../components/ui';
import { useData } from '../../context/DataContext';
import {
  TODAY,
  addDays,
  startOfWeek,
  endOfWeek,
  formatDateLong,
  formatHours,
} from '../../utils/time';
import { sumByCategory } from '../../utils/stats';
import { goalProgress, goalMessage } from '../../utils/goals';
import GoalFormModal from './goals/GoalFormModal';
import './Goals.css';

export default function Goals() {
  const {
    myGoals = [],
    myActivities = [],
    getCategory,
  } = useData();

  const [weekStart, setWeekStart] = useState(
    () => startOfWeek(TODAY)
  );

  const [formOpen, setFormOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    document.title = 'Goals · Waqtuk';
  }, []);

  const weekEnd = endOfWeek(weekStart);

  const weekGoals = myGoals.filter(
    (goal) => goal.weekStart === weekStart
  );

  const totalsByCategory = sumByCategory(
    myActivities,
    weekStart,
    weekEnd
  );

  function previousWeek() {
    setWeekStart((current) => addDays(current, -7));
  }

  function nextWeek() {
    setWeekStart((current) => addDays(current, 7));
  }

  function openAddGoal() {
    setSelectedGoal(null);
    setFormOpen(true);
  }

  function openEditGoal(goal) {
    setSelectedGoal(goal);
    setFormOpen(true);
  }

  function closeGoalForm() {
    setFormOpen(false);
    setSelectedGoal(null);
  }

  function openDeleteGoal(goal) {
    setSelectedGoal(goal);
    setDeleteOpen(true);
  }

  function getProgressTone(status) {
    if (status === 'reached') return 'success';
    if (status === 'exceeded') return 'danger';
    return 'primary';
  }

  function getBadgeTone(status) {
    if (status === 'reached') return 'success';
    if (status === 'exceeded') return 'danger';
    return 'neutral';
  }

  return (
    <div className="wq-goals">
      <PageHeader
        title="Weekly goals"
        subtitle="Set a target for each category and see how the week is going."
        actions={
          <Button onClick={openAddGoal}>
            + Add Goal
          </Button>
        }
      />

      <div className="wq-goals-week-nav">
        <Button
          variant="secondary"
          size="sm"
          onClick={previousWeek}
        >
          ‹ Previous week
        </Button>

        <span className="wq-goals-week-label">
          Week starting {formatDateLong(weekStart)}
        </span>

        <Button
          variant="secondary"
          size="sm"
          onClick={nextWeek}
        >
          Next week ›
        </Button>
      </div>

      <div className="wq-goals-grid wq-g">
        <Card
          title="Goal list"
          className="wq-goals-list-card"
        >
          {weekGoals.length === 0 ? (
            <div className="wq-goals-empty">
              <p>No goals for this week.</p>

              <Button onClick={openAddGoal}>
                + Add Goal
              </Button>
            </div>
          ) : (
            <div className="wq-goals-list">
              {weekGoals.map((goal) => {
                const category = getCategory?.(
                  goal.categoryId
                );

                const logged =
                  totalsByCategory[goal.categoryId] ?? 0;

                const progress = goalProgress(
                  goal,
                  logged
                );

                const progressTone = getProgressTone(
                  progress.status
                );

                const badgeTone = getBadgeTone(
                  progress.status
                );

                return (
                  <div
                    key={goal.id}
                    className="wq-goals-item"
                  >
                    <div className="wq-goals-item-header">
                      <div className="wq-goals-item-info">
                        <CategoryDot
                          color={category?.color}
                        />

                        <span className="wq-goals-category-name">
                          {category?.name ?? goal.categoryId}
                        </span>

                        <Badge tone="info">
                          {goal.direction === 'atLeast'
                            ? 'At least'
                            : 'At most'}
                        </Badge>
                      </div>

                      <div className="wq-goals-item-actions">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openEditGoal(goal)}
                        >
                          Edit
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openDeleteGoal(goal)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    <ProgressBar
                      value={progress.logged}
                      max={progress.target}
                      tone={progressTone}
                      label={`${category?.name ?? goal.categoryId} goal progress`}
                    />

                    <div className="wq-goals-item-footer">
                      <span className="wq-goals-logged">
                        Logged{' '}
                        <strong>
                          {formatHours(progress.logged)}
                        </strong>
                        {' '}of{' '}
                        {formatHours(progress.target)}
                      </span>

                      <Badge tone={badgeTone}>
                        {goalMessage(goal, logged)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <GoalFormModal
        open={formOpen}
        onClose={closeGoalForm}
        goal={selectedGoal}
        defaultWeekStart={weekStart}
      />
    </div>
  );
}
