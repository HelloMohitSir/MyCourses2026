import React from 'react';
import { Link } from 'react-router-dom';

function About() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '15px',
        padding: '3rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#333' }}>About FutureByte</h1>
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
        
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
          A full-stack application built with modern technologies to help you learn and grow.
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚛️</div>
            <h3 style={{ marginBottom: '0.5rem' }}>React</h3>
            <p style={{ color: '#666' }}>Modern frontend framework</p>
          </div>
          <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🚀</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Express</h3>
            <p style={{ color: '#666' }}>Node.js backend framework</p>
          </div>
          <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🍃</div>
            <h3 style={{ marginBottom: '0.5rem' }}>MongoDB</h3>
            <p style={{ color: '#666' }}>NoSQL database</p>
          </div>
          <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎨</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Vite</h3>
            <p style={{ color: '#666' }}>Fast build tool</p>
          </div>
        </div>
        
        <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '10px' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>📊 Features</h3>
          <ul style={{ color: '#666', lineHeight: '2' }}>
            <li>✅ Create, Read, Update, Delete items</li>
            <li>✅ MongoDB Atlas integration</li>
            <li>✅ Responsive design</li>
            <li>✅ Modern UI with gradients</li>
            <li>✅ Real-time updates</li>
          </ul>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#999' }}>
          <p>© 2026 FutureByte. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default About;
