import { useState, useRef, useEffect } from 'react';
import { groupTasks, formatDatePill, todayISO, addDaysISO } from '../utils/taskUtils';

const GROUP_META = {
  overdue: { label: 'Overdue', emptyHint: null },
  today: { label: 'Today', emptyHint: null },
  upcoming: { label: 'Upcoming', emptyHint: null },
  noDate: { label: 'No date', emptyHint: null },
};

const FADE_MS = 400;

export default function TaskBoard({ tasks, subtasks, taskActions, subtaskActions }) {
  const [quickAddValue, setQuickAddValue] = useState('');
  const [fadingIds, setFadingIds] = useState(() => new Set());
  const [completedOpen, setCompletedOpen] = useState(false);

  const { addTask, updateTask, toggleTaskCompleted, deleteTask } = taskActions;

  // Derived state — computed every render, never stored.
  const incomplete = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);
  const groups = groupTasks(incomplete);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickAddValue.trim()) return;
    addTask(quickAddValue);
    setQuickAddValue('');
  };

  const handleCompleteClick = (task) => {
    if (task.completed) {
      // Un-completing from the Completed section — instant, no fade.
      toggleTaskCompleted(task.id);
      return;
    }
    setFadingIds((prev) => new Set(prev).add(task.id));
    window.setTimeout(() => {
      toggleTaskCompleted(task.id);
      setFadingIds((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }, FADE_MS);
  };

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Tasks</h2>
        <span className="panel-count">{incomplete.length} open</span>
      </div>

      <form className="quick-add" onSubmit={handleQuickAdd}>
        <span className="quick-add-prompt">+</span>
        <input
          type="text"
          value={quickAddValue}
          onChange={(e) => setQuickAddValue(e.target.value)}
          placeholder="Add a task and press Enter…"
          aria-label="New task title"
        />
      </form>

      {['overdue', 'today', 'upcoming', 'noDate'].map((groupKey) => {
        const groupTasksList = groups[groupKey];
        if (groupTasksList.length === 0) return null;
        return (
          <TaskGroup
            key={groupKey}
            title={GROUP_META[groupKey].label}
            tone={groupKey}
            tasks={groupTasksList}
            subtasks={subtasks}
            fadingIds={fadingIds}
            onToggleComplete={handleCompleteClick}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            subtaskActions={subtaskActions}
          />
        );
      })}

      {incomplete.length === 0 && (
        <p className="empty-hint">No open tasks. Add one above to get started.</p>
      )}

      <div className="completed-section">
        <button
          type="button"
          className="completed-toggle"
          onClick={() => setCompletedOpen((v) => !v)}
        >
          <span className={`chevron ${completedOpen ? 'chevron--open' : ''}`}>›</span>
          Completed ({completed.length})
        </button>
        {completedOpen && (
          <ul className="task-list task-list--completed">
            {completed.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                subtasks={subtasks}
                isFading={false}
                onToggleComplete={handleCompleteClick}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                subtaskActions={subtaskActions}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function TaskGroup({ title, tone, tasks, subtasks, fadingIds, onToggleComplete, onUpdateTask, onDeleteTask, subtaskActions }) {
  return (
    <div className="task-group">
      <h3 className={`task-group-title task-group-title--${tone}`}>{title}</h3>
      <ul className="task-list">
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            subtasks={subtasks}
            isFading={fadingIds.has(task.id)}
            onToggleComplete={onToggleComplete}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            subtaskActions={subtaskActions}
          />
        ))}
      </ul>
    </div>
  );
}

function TaskRow({ task, subtasks, isFading, onToggleComplete, onUpdateTask, onDeleteTask, subtaskActions }) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [subtasksOpen, setSubtasksOpen] = useState(false);
  const [subtaskDraft, setSubtaskDraft] = useState('');
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (editingTitle) titleInputRef.current?.focus();
  }, [editingTitle]);

  const mine = subtasks.filter((s) => s.parentId === task.id);
  const doneCount = mine.filter((s) => s.completed).length;

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== task.title) {
      onUpdateTask(task.id, { title: trimmed });
    } else {
      setTitleDraft(task.title);
    }
    setEditingTitle(false);
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!subtaskDraft.trim()) return;
    subtaskActions.addSubtask(task.id, subtaskDraft);
    setSubtaskDraft('');
  };

  return (
    <li className={`task-row ${isFading ? 'task-row--fading' : ''}`}>
      <div className="task-row-main">
        <button
          type="button"
          className={`task-checkbox ${task.completed || isFading ? 'task-checkbox--checked' : ''}`}
          onClick={() => onToggleComplete(task)}
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        />

        <div className="task-row-body">
          {editingTitle ? (
            <input
              ref={titleInputRef}
              className="task-title-input"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitTitle();
                if (e.key === 'Escape') {
                  setTitleDraft(task.title);
                  setEditingTitle(false);
                }
              }}
            />
          ) : (
            <button
              type="button"
              className={`task-title ${task.completed || isFading ? 'task-title--completed' : ''}`}
              onClick={() => setEditingTitle(true)}
            >
              {task.title}
            </button>
          )}

          {mine.length > 0 && (
            <button
              type="button"
              className="subtask-progress-badge"
              onClick={() => setSubtasksOpen((v) => !v)}
              title="Show subtasks"
            >
              {doneCount}/{mine.length}
            </button>
          )}
        </div>

        <div className="task-row-actions">
          <DatePill
            dueDate={task.dueDate}
            open={pickerOpen}
            onToggleOpen={() => setPickerOpen((v) => !v)}
            onPick={(iso) => {
              onUpdateTask(task.id, { dueDate: iso });
              setPickerOpen(false);
            }}
          />
          <button
            type="button"
            className="icon-btn"
            onClick={() => setSubtasksOpen((v) => !v)}
            title="Subtasks"
            aria-label="Toggle subtasks"
          >
            ⋯
          </button>
          <button
            type="button"
            className="icon-btn icon-btn--danger"
            onClick={() => onDeleteTask(task.id)}
            aria-label="Delete task"
            title="Delete task"
          >
            ×
          </button>
        </div>
      </div>

      {subtasksOpen && (
        <div className="subtask-panel">
          <ul className="subtask-list">
            {mine.map((s) => (
              <li key={s.id} className="subtask-row">
                <button
                  type="button"
                  className={`task-checkbox task-checkbox--sm ${s.completed ? 'task-checkbox--checked' : ''}`}
                  onClick={() => subtaskActions.toggleSubtaskCompleted(s.id)}
                  aria-label={s.completed ? 'Mark subtask incomplete' : 'Mark subtask complete'}
                />
                <span className={`subtask-title ${s.completed ? 'subtask-title--completed' : ''}`}>
                  {s.title}
                </span>
                <button
                  type="button"
                  className="icon-btn icon-btn--ghost"
                  onClick={() => subtaskActions.deleteSubtask(s.id)}
                  aria-label="Delete subtask"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <form className="subtask-add" onSubmit={handleAddSubtask}>
            <span className="quick-add-prompt">+</span>
            <input
              type="text"
              value={subtaskDraft}
              onChange={(e) => setSubtaskDraft(e.target.value)}
              placeholder="Add a subtask…"
              aria-label="New subtask title"
            />
          </form>
        </div>
      )}
    </li>
  );
}

function DatePill({ dueDate, open, onToggleOpen, onPick }) {
  const [customValue, setCustomValue] = useState(dueDate || todayISO());

  return (
    <div className="date-pill-wrap">
      <button
        type="button"
        className={`date-pill ${dueDate ? '' : 'date-pill--empty'}`}
        onClick={onToggleOpen}
      >
        <span className="date-pill-icon" aria-hidden="true">📅</span>
        {dueDate ? formatDatePill(dueDate) : 'Add date'}
      </button>

      {open && (
        <div className="quick-picker">
          <button type="button" className="quick-picker-option" onClick={() => onPick(todayISO())}>
            Today
          </button>
          <button type="button" className="quick-picker-option" onClick={() => onPick(addDaysISO(1))}>
            Tomorrow
          </button>
          <button type="button" className="quick-picker-option" onClick={() => onPick(addDaysISO(6))}>
            This week
          </button>
          <div className="quick-picker-custom">
            <input
              type="date"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
            />
            <button type="button" className="quick-picker-option quick-picker-option--confirm" onClick={() => onPick(customValue)}>
              Set
            </button>
          </div>
          {dueDate && (
            <button type="button" className="quick-picker-option quick-picker-option--clear" onClick={() => onPick(null)}>
              Clear date
            </button>
          )}
        </div>
      )}
    </div>
  );
}
