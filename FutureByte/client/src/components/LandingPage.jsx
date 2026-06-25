import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            🚀 FutureByte
            <span className="hero-subtitle">Learn. Build. Innovate.</span>
          </h1>
          <p className="hero-description">
            Your complete platform for mastering modern technology.
            Explore courses, track your progress, and build amazing projects.
          </p>
          <div className="hero-buttons">
            <Link to="/dashboard" className="btn-primary">
              Get Started
            </Link>
            <Link to="/about" className="btn-secondary">
              Learn More
            </Link>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">7+</span>
            <span className="stat-label">Courses Available</span>
          </div>
          <div className="stat">
            <span className="stat-number">100%</span>
            <span className="stat-label">Hands-on Learning</span>
          </div>
          <div className="stat">
            <span className="stat-number">24/7</span>
            <span className="stat-label">Access Anywhere</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose FutureByte?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Curated Courses</h3>
            <p>Expertly designed courses covering the latest technologies</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Hands-on Projects</h3>
            <p>Build real-world projects that showcase your skills</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Community Support</h3>
            <p>Connect with learners and mentors from around the world</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Track Progress</h3>
            <p>Monitor your learning journey with detailed analytics</p>
          </div>
        </div>
      </section>

      {/* Course Preview Section */}
      <section className="preview">
        <h2>Popular Courses</h2>
        <div className="course-preview-grid">
          <div className="course-card">
            <span className="course-emoji">⚛️</span>
            <h3>React Mastery</h3>
            <p>Build modern web applications with React</p>
            <span className="course-tag">Popular</span>
          </div>
          <div className="course-card">
            <span className="course-emoji">🐍</span>
            <h3>Python Data Science</h3>
            <p>Analyze and visualize data with Python</p>
            <span className="course-tag">Trending</span>
          </div>
          <div className="course-card">
            <span className="course-emoji">📱</span>
            <h3>React Native</h3>
            <p>Build cross-platform mobile apps</p>
            <span className="course-tag">New</span>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/dashboard" className="btn-primary">
            View All Courses
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>🚀 FutureByte</h3>
            <p>Empowering the next generation of developers</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/about">About</Link>
          </div>
          <div className="footer-section">
            <h4>Connect</h4>
            <a href="#">GitHub</a>
            <a href="#">Twitter</a>
            <a href="#">LinkedIn</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 FutureByte. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
