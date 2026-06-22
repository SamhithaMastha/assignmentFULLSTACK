import { useState, useRef, useEffect } from 'react';
import { formatDatePill } from '../utils/taskUtils';

export default function GoalTracker({ goals, goalActions }) {
  const [titleValue, setTitleValue] = useState('');
  const [dateValue, setDateValue] = useState('');
  const { addGoal, updateGoal, adjustGoalProgress, deleteGoal } = goalActions;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!titleValue.trim()) return;
    addGoal(titleValue, dateValue || null);
    setTitleValue('');
    setDateValue('');
  };

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Goals</h2>
        <span className="panel-count">{goals.length} tracked</span>
      </div>

      <form className="goal-add" onSubmit={handleAdd}>
        <span className="quick-add-prompt">+</span>
        <input
          type="text"
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
          placeholder="Add a goal…"
          aria-label="New goal title"
        />
        <input
          type="date"
          className="goal-add-date"
          value={dateValue}
          onChange={(e) => setDateValue(e.target.value)}
          aria-label="Optional target date"
        />
        <button type="submit" className="btn btn--ghost">Add</button>
      </form>

      {goals.length === 0 ? (
        <p className="empty-hint">No goals yet. What are you working toward?</p>
      ) : (
        <div className="goal-grid">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onUpdate={updateGoal}
              onAdjust={adjustGoalProgress}
              onDelete={deleteGoal}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function GoalCard({ goal, onUpdate, onAdjust, onDelete }) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(goal.title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editingTitle) inputRef.current?.focus();
  }, [editingTitle]);

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== goal.title) {
      onUpdate(goal.id, { title: trimmed });
    } else {
      setTitleDraft(goal.title);
    }
    setEditingTitle(false);
  };

  const isComplete = goal.progress >= 100;

  return (
    <div className={`goal-card ${isComplete ? 'goal-card--complete' : ''}`}>
      <div className="goal-card-top">
        {editingTitle ? (
          <input
            ref={inputRef}
            className="task-title-input"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitTitle();
              if (e.key === 'Escape') {
                setTitleDraft(goal.title);
                setEditingTitle(false);
              }
            }}
          />
        ) : (
          <button type="button" className="goal-title" onClick={() => setEditingTitle(true)}>
            {goal.title}
          </button>
        )}
        <button
          type="button"
          className="icon-btn icon-btn--danger"
          onClick={() => onDelete(goal.id)}
          aria-label="Delete goal"
        >
          ×
        </button>
      </div>

      {goal.targetDate && (
        <span className="goal-target-date">target {formatDatePill(goal.targetDate)}</span>
      )}

      <div className="goal-progress-bar" role="progressbar" aria-valuenow={goal.progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="goal-progress-fill" style={{ width: `${goal.progress}%` }} />
      </div>

      <div className="goal-controls">
        <button type="button" className="goal-step-btn" onClick={() => onAdjust(goal.id, -10)} aria-label="Decrease progress">
          −
        </button>
        <span className="goal-progress-value">{goal.progress}%</span>
        <button type="button" className="goal-step-btn" onClick={() => onAdjust(goal.id, 10)} aria-label="Increase progress">
          +
        </button>
      </div>
    </div>
  );
}
