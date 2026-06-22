import './App.css';
import { useLocalStorage } from './hooks/useLocalStorage';
import { makeId } from './utils/taskUtils';
import Dashboard from './components/Dashboard';

/**
 * State shape (see README.md for the full diagram):
 *
 *   tasks:      [{ id, title, dueDate: 'YYYY-MM-DD' | null, completed }]
 *   subtasks:   [{ id, parentId, title, completed }]   <- flat, NOT nested
 *   goals:      [{ id, title, targetDate: 'YYYY-MM-DD' | null, progress }]
 *   moodItems:  [{ id, type: 'color' | 'image', value }]
 *
 * App.jsx is the only place these four lists live. Everything below it
 * (Dashboard and its children) receives data + setters as props.
 */
export default function App() {
  const [tasks, setTasks] = useLocalStorage('cipher:tasks', []);
  const [subtasks, setSubtasks] = useLocalStorage('cipher:subtasks', []);
  const [goals, setGoals] = useLocalStorage('cipher:goals', []);
  const [moodItems, setMoodItems] = useLocalStorage('cipher:moodItems', []);

  // ---- Tasks ----------------------------------------------------------
  const addTask = (title, dueDate = null) => {
    if (!title.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: makeId(), title: title.trim(), dueDate, completed: false },
    ]);
  };

  const updateTask = (id, updates) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const toggleTaskCompleted = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    // Cascade: remove this task's subtasks too.
    setSubtasks((prev) => prev.filter((s) => s.parentId !== id));
  };

  // ---- Subtasks (flat, parentId reference) -----------------------------
  const addSubtask = (parentId, title) => {
    if (!title.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      { id: makeId(), parentId, title: title.trim(), completed: false },
    ]);
  };

  const toggleSubtaskCompleted = (id) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const deleteSubtask = (id) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  // ---- Goals ------------------------------------------------------------
  const addGoal = (title, targetDate = null) => {
    if (!title.trim()) return;
    setGoals((prev) => [
      ...prev,
      { id: makeId(), title: title.trim(), targetDate, progress: 0 },
    ]);
  };

  const updateGoal = (id, updates) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const adjustGoalProgress = (id, delta) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, progress: Math.min(100, Math.max(0, g.progress + delta)) }
          : g
      )
    );
  };

  const deleteGoal = (id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // ---- Mood board ---------------------------------------------------------
  const addMoodItem = (type, value) => {
    if (!value.trim()) return;
    setMoodItems((prev) => [...prev, { id: makeId(), type, value: value.trim() }]);
  };

  const removeMoodItem = (id) => {
    setMoodItems((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <Dashboard
      tasks={tasks}
      subtasks={subtasks}
      goals={goals}
      moodItems={moodItems}
      taskActions={{ addTask, updateTask, toggleTaskCompleted, deleteTask }}
      subtaskActions={{ addSubtask, toggleSubtaskCompleted, deleteSubtask }}
      goalActions={{ addGoal, updateGoal, adjustGoalProgress, deleteGoal }}
      moodActions={{ addMoodItem, removeMoodItem }}
    />
  );
}
