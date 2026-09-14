/**
 * Utility functions for Follow-Up due dates, badge types, and calculations
 */

function parseDateInput(input) {
  if (!input) return new Date();
  if (input instanceof Date && !isNaN(input.getTime())) return input;

  // Try parsing string directly
  const parsed = new Date(input);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  // Handle common format like "15 Sep" or "15 Sep 2026"
  if (typeof input === 'string') {
    const parts = input.trim().split(/\s+/);
    if (parts.length >= 2) {
      const day = parseInt(parts[0], 10);
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthIndex = monthNames.findIndex((m) => parts[1].toLowerCase().startsWith(m));
      const year = parts[2] ? parseInt(parts[2], 10) : new Date().getFullYear();

      if (!isNaN(day) && monthIndex !== -1) {
        return new Date(year, monthIndex, day);
      }
    }
  }

  return new Date();
}

function computeDueInfo(dueDate, isCompleted = false) {
  if (isCompleted) {
    return {
      badge: 'Completed',
      badgeType: 'completed',
      dotColor: '#10b981',
      diffDays: 0,
      isOverdue: false,
      urgencyRank: 5,
    };
  }

  const date = parseDateInput(dueDate);
  const now = new Date();

  // Normalize to local calendar day start
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dueStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

  const diffDays = Math.round((dueStart - todayStart) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const daysAgo = Math.abs(diffDays);
    return {
      badge: daysAgo === 1 ? 'Yesterday' : `${daysAgo}d overdue`,
      badgeType: 'overdue',
      dotColor: '#ef4444',
      diffDays,
      isOverdue: true,
      urgencyRank: 1,
    };
  } else if (diffDays === 0) {
    return {
      badge: 'Today',
      badgeType: 'today',
      dotColor: '#ef4444',
      diffDays: 0,
      isOverdue: false,
      urgencyRank: 2,
    };
  } else if (diffDays === 1) {
    return {
      badge: 'Tomorrow',
      badgeType: 'tomorrow',
      dotColor: '#f59e0b',
      diffDays: 1,
      isOverdue: false,
      urgencyRank: 3,
    };
  } else {
    const formatted = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return {
      badge: formatted,
      badgeType: 'date',
      dotColor: '#3b82f6',
      diffDays,
      isOverdue: false,
      urgencyRank: 4,
    };
  }
}

module.exports = {
  parseDateInput,
  computeDueInfo,
};
