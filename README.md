# Cipher MVP — Tasks, Goals, Focus & Mood Board

React (Vite) front end for Cipher. No backend — everything lives in
`localStorage` and survives a hard refresh.

## Run it

```
npm install
npm run dev
```

## State shape

Four flat lists, each persisted independently via `useLocalStorage`, all
owned by `App.jsx` and passed down as props. Nothing is nested — subtasks
reference their parent task by id instead of living inside it, which is
the relational shape this will map to in Postgres later.

```
tasks       [{ id, title, dueDate: 'YYYY-MM-DD' | null, completed }]
subtasks    [{ id, parentId, title, completed }]      // parentId -> tasks.id
goals       [{ id, title, targetDate: 'YYYY-MM-DD' | null, progress: 0-100 }]
moodItems   [{ id, type: 'color' | 'image', value }]

activeSection  'tasks' | 'goals' | 'focus' | 'mood'    // owned by Dashboard
focusTaskId    string | ''                              // owned by FocusTimer (bonus)
```

```
            ┌────────────┐
            │  App.jsx   │  owns tasks / subtasks / goals / moodItems
            └─────┬──────┘  (4x useLocalStorage)
                  │ props (data + action handlers)
            ┌─────▼──────┐
            │ Dashboard  │  owns activeSection (useLocalStorage)
            └──┬──┬──┬──┬┘  renders one section at a time
       ┌────────┘  │  │  └────────┐
  TaskBoard   GoalTracker  FocusTimer   MoodBoard
       │
       └─ subtasks filtered by parentId at render (groupTasks, derived)
```

Task groups (Overdue / Today / Upcoming / No date) are **never stored**.
`groupTasks(tasks)` in `utils/taskUtils.js` is a pure function called
during render and re-derives the buckets from `dueDate` every time.

## What's done

- **P0 — Persistence layer.** `useLocalStorage(key, default)` hook, lazy
  initializer on mount, `useEffect` writes on every change. Used for all
  four data lists plus the active dashboard tab and the focus-linked task.
- **P1 — TaskBoard.** Quick add (title only), derived grouping, quick-pick
  date picker (Today / Tomorrow / This week / Custom), inline title edit,
  click-the-date-pill-to-reopen-the-picker, complete-with-fade (~400ms
  opacity/scale transition before the row moves to a collapsed Completed
  section), flat subtasks with a parentId reference and a progress badge
  (`n/m`), cascading delete (removing a task removes its subtasks).
- **P2 — GoalTracker.** Goal cards with title, optional target date, and a
  progress bar; add via controlled input; click title to edit inline
  (same pattern as tasks); `+`/`–` progress buttons clamped to 0–100.
- **P3 — FocusTimer.** `useTimer` custom hook encapsulates the countdown
  (`setInterval` + cleanup, guarded against double-starting on repeated
  clicks); mm:ss display in a glowing progress ring; start/pause/reset;
  5/15/25-minute presets.
- **P4 — MoodBoard.** CSS grid of color or image items from a single
  input (auto-detects a hex color vs. an image URL); click an item to
  remove it.
- **P5 — Dashboard.** Tab navigation with `activeSection` persisted to
  localStorage so it remembers the last open tab; one shared
  header/nav/content layout wrapping all four sections.
- **Bonus — Focus-on-task linking.** A dropdown of incomplete tasks in
  FocusTimer; the selected task id is persisted alongside the rest of the
  app's state, and "Focusing on: `<task title>`" shows above the ring
  while it's selected. The link clears automatically if that task is
  completed or deleted elsewhere.

## Known bugs / rough edges

- "This week" in the date quick-picker is a fixed +6 days, not "the next
  Friday" or similar — good enough for an MVP but not calendar-aware.
- Mood board image items aren't checked for broken URLs; a bad link just
  renders a broken image rather than falling back to anything.
- No drag-to-reorder anywhere (tasks, goals, or mood grid) — order is
  always insertion order.
- The focus timer's countdown is wall-clock-naive: if the tab is
  backgrounded for a long time, `setInterval` can lag slightly behind a
  real clock (a known browser throttling behavior, not something this
  MVP corrects for).
- Subtask panels collapse back to closed on every reload (that
  open/closed state is intentionally local-only, not persisted).
