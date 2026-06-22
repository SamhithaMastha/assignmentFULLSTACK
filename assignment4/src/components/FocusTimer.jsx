import { useState, useEffect } from 'react';
import { useTimer, formatMMSS } from '../hooks/useTimer';
import { useLocalStorage } from '../hooks/useLocalStorage';

const PRESETS = [
  { label: '5 min', seconds: 5 * 60 },
  { label: '15 min', seconds: 15 * 60 },
  { label: '25 min', seconds: 25 * 60 },
];

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function FocusTimer({ incompleteTasks }) {
  const [totalDuration, setTotalDuration] = useState(PRESETS[2].seconds);
  const { secondsRemaining, isRunning, start, pause, reset, setDuration } = useTimer(totalDuration);

  // Bonus: which task (if any) this session is focused on. Persisted
  // alongside the rest of the app's state, not tied to timer internals.
  const [selectedTaskId, setSelectedTaskId] = useLocalStorage('cipher:focusTaskId', '');

  // If the focused task got completed or deleted elsewhere, drop the link.
  useEffect(() => {
    if (selectedTaskId && !incompleteTasks.some((t) => t.id === selectedTaskId)) {
      setSelectedTaskId('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incompleteTasks]);

  const focusedTask = incompleteTasks.find((t) => t.id === selectedTaskId);
  const isDone = secondsRemaining === 0;
  const progress = totalDuration > 0 ? secondsRemaining / totalDuration : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const handlePreset = (seconds) => {
    setTotalDuration(seconds);
    setDuration(seconds);
  };

  const handleReset = () => reset(totalDuration);

  return (
    <section className="panel panel--focus">
      <div className="panel-heading">
        <h2>Focus</h2>
        <span className="panel-count">{isRunning ? 'running' : isDone ? 'done' : 'paused'}</span>
      </div>

      <div className="focus-task-select-row">
        <label htmlFor="focus-task-select" className="focus-task-label">focusing on</label>
        <select
          id="focus-task-select"
          className="focus-task-select"
          value={selectedTaskId}
          onChange={(e) => setSelectedTaskId(e.target.value)}
        >
          <option value="">no task — general focus</option>
          {incompleteTasks.map((t) => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </div>

      {focusedTask && (
        <p className="focus-banner">Focusing on: <strong>{focusedTask.title}</strong></p>
      )}

      <div className={`focus-ring-wrap ${isRunning ? 'focus-ring-wrap--running' : ''}`}>
        <svg viewBox="0 0 220 220" className="focus-ring">
          <circle cx="110" cy="110" r={RADIUS} className="focus-ring-track" />
          <circle
            cx="110"
            cy="110"
            r={RADIUS}
            className="focus-ring-progress"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="focus-display">{formatMMSS(secondsRemaining)}</div>
      </div>

      <div className="focus-presets">
        {PRESETS.map((p) => (
          <button
            key={p.seconds}
            type="button"
            className={`preset-btn ${totalDuration === p.seconds ? 'preset-btn--active' : ''}`}
            onClick={() => handlePreset(p.seconds)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="focus-controls">
        {isRunning ? (
          <button type="button" className="btn btn--primary" onClick={pause}>Pause</button>
        ) : (
          <button type="button" className="btn btn--primary" onClick={start} disabled={isDone}>
            {isDone ? 'Session complete' : secondsRemaining === totalDuration ? 'Start' : 'Resume'}
          </button>
        )}
        <button type="button" className="btn btn--ghost" onClick={handleReset}>Reset</button>
      </div>
    </section>
  );
}
