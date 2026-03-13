// T101: SortControls component
import { useState } from 'react';

export default function SortControls({ value, onChange }) {
  const [sortBy, setSortBy] = useState(value || 'distance');

  const handleChange = (e) => {
    const newValue = e.target.value;
    setSortBy(newValue);
    onChange(newValue);
  };

  return (
    <div className="sort-controls">
      <label htmlFor="sortBy">Sort by:</label>
      <select
        id="sortBy"
        value={sortBy}
        onChange={handleChange}
        className="sort-select"
      >
        <option value="distance">Distance (closest first)</option>
        <option value="date">Date (soonest first)</option>
        <option value="popularity">Popularity (most RSVPs)</option>
      </select>
    </div>
  );
}
