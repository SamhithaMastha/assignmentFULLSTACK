import { useState } from 'react';

const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export default function MoodBoard({ moodItems, moodActions }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const { addMoodItem, removeMoodItem } = moodActions;

  const handleAdd = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    if (HEX_PATTERN.test(trimmed)) {
      addMoodItem('color', trimmed);
    } else if (/^https?:\/\//i.test(trimmed)) {
      addMoodItem('image', trimmed);
    } else {
      setError('Enter a hex color (#3ddc84) or an image URL (https://…)');
      return;
    }
    setError('');
    setValue('');
  };

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Mood board</h2>
        <span className="panel-count">{moodItems.length} items</span>
      </div>

      <form className="mood-add" onSubmit={handleAdd}>
        <span className="quick-add-prompt">+</span>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError('');
          }}
          placeholder="#3ddc84 or https://image-url…"
          aria-label="Hex color or image URL"
        />
        <button type="submit" className="btn btn--ghost">Add</button>
      </form>
      {error && <p className="form-error">{error}</p>}

      {moodItems.length === 0 ? (
        <p className="empty-hint">Empty board. Drop in colors or images that match the vibe you're going for.</p>
      ) : (
        <div className="mood-grid">
          {moodItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="mood-item"
              style={item.type === 'color' ? { background: item.value } : undefined}
              onClick={() => removeMoodItem(item.id)}
              title="Click to remove"
            >
              {item.type === 'image' && (
                <img src={item.value} alt="" className="mood-item-img" />
              )}
              <span className="mood-item-remove" aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
