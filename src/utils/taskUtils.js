/** Tiny dependency-free unique id, good enough for a localStorage-only app. */
export function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * groupTasks(tasks) -> { overdue, today, upcoming, noDate }
 *
 * Pure function — call it during render, never store the result in state.
 * Groups are derived from each task's dueDate every time tasks change.
 */
export function groupTasks(tasks) {
  const groups = { overdue: [], today: [], upcoming: [], noDate: [] };

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  for (const task of tasks) {
    if (!task.dueDate) {
      groups.noDate.push(task);
      continue;
    }
    const due = new Date(task.dueDate);
    if (due < startOfToday) {
      groups.overdue.push(task);
    } else if (due < startOfTomorrow) {
      groups.today.push(task);
    } else {
      groups.upcoming.push(task);
    }
  }

  return groups;
}

/** Format an ISO date string ('YYYY-MM-DD') for the date pill, e.g. "Jul 8". */
export function formatDatePill(isoDate) {
  if (!isoDate) return null;
  // Avoid timezone shift: parse the date parts directly instead of
  // letting `new Date('YYYY-MM-DD')` interpret it as UTC midnight.
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Today's date as 'YYYY-MM-DD', in local time. */
export function todayISO() {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${m}-${d}`;
}

export function addDaysISO(days) {
  const now = new Date();
  now.setDate(now.getDate() + days);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${m}-${d}`;
}
