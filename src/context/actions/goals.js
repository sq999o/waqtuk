
import { makeId } from '../../utils/ids.js';
import { validateGoal } from '../../utils/validators';

/**
 * Add a new goal for the signed-in student.
 *
 * @param {Object} data - Complete application data.
 * @param {Object} payload - New goal fields.
 * @param {Object} ctx - Context containing currentUser.
 * @returns {{ data: Object, result: Object }}
 */
export function addGoal(data, payload, ctx) {
  const studentId = ctx.currentUser?.id;

  if (!studentId) {
    return {
      data,
      result: { ok: false, error: 'Student not found.' },
    };
  }

  const studentGoals = data.goals.filter(
    (goal) => goal.studentId === studentId
  );

  const check = validateGoal(payload, {
    goals: studentGoals,
  });

  if (!check.ok) {
    return {
      data,
      result: check,
    };
  }

  const newGoal = {
    id: makeId('g'),
    studentId,
    categoryId: payload.categoryId,
    weekStart: payload.weekStart,
    targetMinutes: Number(payload.targetMinutes),
    direction: payload.direction,
  };

  return {
    data: {
      ...data,
      goals: [...data.goals, newGoal],
    },
    result: {
      ok: true,
      id: newGoal.id,
    },
  };
}

/**
 * Update a goal belonging to the signed-in student.
 *
 * @param {Object} data - Complete application data.
 * @param {string} id - Goal ID.
 * @param {Object} changes - Fields to update.
 * @param {Object} ctx - Context containing currentUser.
 * @returns {{ data: Object, result: Object }}
 */
export function updateGoal(data, id, changes, ctx) {
  const studentId = ctx.currentUser?.id;

  const existingGoal = data.goals.find(
    (goal) =>
      goal.id === id &&
      goal.studentId === studentId
  );

  if (!existingGoal) {
    return {
      data,
      result: {
        ok: false,
        error: 'Goal not found.',
      },
    };
  }

  const updatedGoal = {
    ...existingGoal,
    ...changes,
    id: existingGoal.id,
    studentId: existingGoal.studentId,
  };

  const studentGoals = data.goals.filter(
    (goal) => goal.studentId === studentId
  );

  const check = validateGoal(updatedGoal, {
    goals: studentGoals,
    exceptId: id,
  });

  if (!check.ok) {
    return {
      data,
      result: check,
    };
  }

  const newGoals = data.goals.map((goal) =>
    goal.id === id
      ? {
          ...updatedGoal,
          targetMinutes: Number(updatedGoal.targetMinutes),
        }
      : goal
  );

  return {
    data: {
      ...data,
      goals: newGoals,
    },
    result: {
      ok: true,
      id,
    },
  };
}

/**
 * Delete a goal belonging to the signed-in student.
 * Logged activities remain unchanged.
 *
 * @param {Object} data - Complete application data.
 * @param {string} id - Goal ID.
 * @param {Object} ctx - Context containing currentUser.
 * @returns {{ data: Object, result: Object }}
 */
export function deleteGoal(data, id, ctx) {
  const studentId = ctx.currentUser?.id;

  const existingGoal = data.goals.find(
    (goal) =>
      goal.id === id &&
      goal.studentId === studentId
  );

  if (!existingGoal) {
    return {
      data,
      result: {
        ok: false,
        error: 'Goal not found.',
      },
    };
  }

  return {
    data: {
      ...data,
      goals: data.goals.filter(
        (goal) => goal.id !== id
      ),
    },
    result: {
      ok: true,
    },
  };
}
