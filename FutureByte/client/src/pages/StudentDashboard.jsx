import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDashboard();
  }, [user]);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/students/dashboard/${user.studentId || user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading dashboard...</div>;
  }

  return (
    <div className="student-dashboard">
      <h1>🎓 Student Dashboard</h1>
      
      {dashboardData && (
        <>
          <div className="student-profile">
            <h2>Profile</h2>
            <p><strong>Name:</strong> {dashboardData.student.name}</p>
            <p><strong>Student ID:</strong> {dashboardData.student.studentId}</p>
            <p><strong>Grade:</strong> {dashboardData.student.grade || 'Not set'}</p>
            <p><strong>Major:</strong> {dashboardData.student.major || 'Not set'}</p>
            <p><strong>Points:</strong> {dashboardData.student.points}</p>
          </div>

          <div className="student-stats">
            <h2>📊 Progress</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>{dashboardData.stats.totalCourses}</h3>
                <p>Total Courses</p>
              </div>
              <div className="stat-card">
                <h3>{dashboardData.stats.completedCourses}</h3>
                <p>Completed</p>
              </div>
              <div className="stat-card">
                <h3>{dashboardData.stats.totalPoints}</h3>
                <p>Points</p>
              </div>
              <div className="stat-card">
                <h3>{dashboardData.stats.badgesCount}</h3>
                <p>Badges</p>
              </div>
            </div>
          </div>

          <div className="enrolled-courses">
            <h2>📚 Enrolled Courses</h2>
            <div className="course-grid">
              {dashboardData.enrolledCourses.map((course) => (
                <div key={course.id} className="course-card">
                  <h3>{course.name}</h3>
                  <p>{course.description}</p>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <p>Progress: {course.progress}%</p>
                  {course.completed && <span className="completed-badge">✅ Completed</span>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StudentDashboard;
