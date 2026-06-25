import React, { useState, useEffect } from 'react';
import { getItems, createItem, deleteItem } from '../services/api';
import { Link } from 'react-router-dom';

function Dashboard() {
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
      setError('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createItem(newItem);
      setNewItem({ name: '', description: '' });
      loadItems();
    } catch (error) {
      alert('Failed to create item');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this item?')) {
      try {
        await deleteItem(id);
        loadItems();
      } catch (error) {
        alert('Failed to delete item');
      }
    }
  };

  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <div className="loading-spinner"></div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '15px',
        padding: '2rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '2px solid #e0e0e0'
        }}>
          <div>
            <h1 style={{ color: '#333' }}>📚 Items</h1>
            <p style={{ color: '#666' }}>Manage your learning resources</p>
          </div>
          <Link to="/" style={{
            padding: '0.5rem 1rem',
            background: '#667eea',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px'
          }}>
            ← Back Home
          </Link>
        </div>
        
        <div style={{
          background: '#f8f9fa',
          padding: '2rem',
          borderRadius: '10px',
          marginBottom: '2rem'
        }}>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Item name..."
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '0.75rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
              required
            />
            <input
              type="text"
              placeholder="Description..."
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '0.75rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
              required
            />
            <button type="submit" style={{
              padding: '0.75rem 2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              + Create
            </button>
          </form>
        </div>

        {error && (
          <div style={{
            background: '#fee',
            color: '#c0392b',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <span style={{ color: '#666' }}>Total: {items.length} items</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {items.map((item) => (
            <div key={item._id} style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '10px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #667eea',
              transition: 'transform 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.5rem'
              }}>
                <h3 style={{ color: '#333' }}>{item.name}</h3>
                <button
                  onClick={() => handleDelete(item._id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#dc3545',
                    fontSize: '1.5rem',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              </div>
              <p style={{ color: '#666', marginBottom: '1rem' }}>{item.description}</p>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: '#999',
                fontSize: '0.85rem',
                paddingTop: '0.5rem',
                borderTop: '1px solid #f0f0f0'
              }}>
                <small>📅 {new Date(item.createdAt).toLocaleDateString()}</small>
                <small>#{item._id.slice(-4)}</small>
              </div>
            </div>
          ))}
        </div>
        
        {items.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#999'
          }}>
            <p>No items yet. Create your first item above! 🎯</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
