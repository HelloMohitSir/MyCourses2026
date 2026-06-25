import React, { useState } from 'react';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleChange = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <input
      type="text"
      placeholder="🔍 Search items..."
      value={query}
      onChange={handleChange}
      style={{
        width: '100%',
        padding: '0.75rem',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        fontSize: '1rem',
        marginBottom: '1rem'
      }}
    />
  );
}

export default SearchBar;
