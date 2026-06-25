// src/App.jsx
import React, { useState, useEffect } from 'react';
import { getItems, createItem, deleteItem } from './services/api';
import './App.css';

function App() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await getItems();
      setItems(response.data);
      setError(null);
    } catch (error) {
      console.error('Error loading items:', error);
      setError('Failed to load items. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim() || !newItem.description.trim()) {
      alert('Please fill in both fields');
      return;
    }
    
    try {
      await createItem(newItem);
      setNewItem({ name: '', description: '' });
      loadItems();
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Failed to create item');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(id);
        loadItems();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading items...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>🚀 FutureByte Dashboard</h1>
          <p>Connected to MongoDB • {items.length} items</p>
        </div>
      </header>

      <div className="container">
        {error && (
          <div className="error-banner">
            ⚠️ {error}
          </div>
        )}

        <div className="create-form">
          <h2>📝 Create New Item</h2>
          <form onSubmit={handleCreate}>
            <input
              type="text"
              placeholder="Enter item name..."
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Enter description..."
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              required
            />
            <button type="submit">➕ Create Item</button>
          </form>
        </div>

        <div className="items-section">
          <div className="items-header">
            <h2>📚 Items Collection</h2>
            <span className="item-count">{items.length} items</span>
          </div>
          
          {items.length === 0 ? (
            <div className="empty-state">
              <p>No items yet. Create your first item above! 🎯</p>
            </div>
          ) : (
            <div className="items-grid">
              {items.map((item) => (
                <div key={item._id} className="item-card">
                  <div className="item-card-header">
                    <h3>{item.name}</h3>
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDelete(item._id)}
                      title="Delete item"
                    >
                      ×
                    </button>
                  </div>
                  <p>{item.description}</p>
                  <div className="item-meta">
                    <small>📅 {new Date(item.createdAt).toLocaleDateString()}</small>
                    <small>🆔 {item._id.slice(-6)}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
