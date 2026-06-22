import { useLocalStorage } from '../hooks/useLocalStorage';
import TaskBoard from './TaskBoard';
import GoalTracker from './GoalTracker';
import FocusTimer from './FocusTimer';
import MoodBoard from './MoodBoard';

const SECTIONS = [
  { key: 'tasks', label: 'tasks' },
  { key: 'goals', label: 'goals' },
  { key: 'focus', label: 'focus' },
  { key: 'mood', label: 'mood' },
];

/**
 * Dashboard owns navigation only — which section is showing, and the
 * header/nav chrome shared by all four. It does not own task/goal/mood
 * data; that lives in App.jsx and is passed straight through as props.
 */
export default function Dashboard({
  tasks,
  subtasks,
  goals,
  moodItems,
  taskActions,
  subtaskActions,
  goalActions,
  moodActions,
}) {
  const [activeSection, setActiveSection] = useLocalStorage(
    'cipher:activeSection',
    'tasks'
  );

  const incompleteTasks = tasks.filter((t) => !t.completed);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="brand">
          <span className="brand-mark">cipher</span>
          <span className="brand-cursor" aria-hidden="true" />
        </div>
        <p className="brand-tagline">tasks · goals · focus · mood — lives in this browser only</p>
      </header>

      <nav className="dashboard-nav" aria-label="Sections">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            className={`nav-tab ${activeSection === s.key ? 'nav-tab--active' : ''}`}
            onClick={() => setActiveSection(s.key)}
            aria-current={activeSection === s.key}
          >
            <span className="nav-tab-prompt">{activeSection === s.key ? '>' : ' '}</span>
            {s.label}
          </button>
        ))}
      </nav>

      <main className="dashboard-main">
        {activeSection === 'tasks' && (
          <TaskBoard tasks={tasks} subtasks={subtasks} taskActions={taskActions} subtaskActions={subtaskActions} />
        )}
        {activeSection === 'goals' && <GoalTracker goals={goals} goalActions={goalActions} />}
        {activeSection === 'focus' && <FocusTimer incompleteTasks={incompleteTasks} />}
        {activeSection === 'mood' && <MoodBoard moodItems={moodItems} moodActions={moodActions} />}
      </main>
    </div>
  );
}
