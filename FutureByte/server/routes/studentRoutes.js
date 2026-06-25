const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get student profile
router.get('/profile/:studentId', async (req, res) => {
  try {
    const user = await User.findOne({ studentId: req.params.studentId })
      .select('-otp -otpExpires -__v');
    if (!user) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ student: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update student profile
router.put('/profile/:studentId', async (req, res) => {
  try {
    const { name, grade, major, university } = req.body;
    const user = await User.findOne({ studentId: req.params.studentId });
    if (!user) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    user.name = name || user.name;
    user.grade = grade || user.grade;
    user.major = major || user.major;
    user.university = university || user.university;
    await user.save();
    
    res.json({ 
      message: 'Profile updated successfully',
      student: user 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enroll student in course
router.post('/enroll/:studentId', async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = await User.findOne({ studentId: req.params.studentId });
    if (!user) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Check if already enrolled
    const alreadyEnrolled = user.enrolledCourses.some(
      c => c.courseId.toString() === courseId
    );
    if (alreadyEnrolled) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }
    
    user.enrolledCourses.push({
      courseId,
      enrollmentDate: new Date()
    });
    await user.save();
    
    res.json({ 
      message: 'Enrolled successfully',
      enrolledCourses: user.enrolledCourses 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update course progress
router.put('/progress/:studentId/:courseId', async (req, res) => {
  try {
    const { progress } = req.body;
    const user = await User.findOne({ studentId: req.params.studentId });
    if (!user) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const course = user.enrolledCourses.find(
      c => c.courseId.toString() === req.params.courseId
    );
    if (!course) {
      return res.status(404).json({ error: 'Course not found in enrollment' });
    }
    
    course.progress = Math.min(100, progress);
    course.completed = course.progress === 100;
    course.lastAccessed = new Date();
    await user.save();
    
    res.json({ 
      message: 'Progress updated',
      progress: course.progress,
      completed: course.completed 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get student dashboard data
router.get('/dashboard/:studentId', async (req, res) => {
  try {
    const user = await User.findOne({ studentId: req.params.studentId })
      .populate('enrolledCourses.courseId', 'name description')
      .select('-otp -otpExpires -__v');
      
    if (!user) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const dashboardData = {
      student: {
        studentId: user.studentId,
        name: user.name,
        grade: user.grade,
        major: user.major,
        points: user.points,
        badges: user.badges
      },
      enrolledCourses: user.enrolledCourses.map(c => ({
        id: c.courseId?._id,
        name: c.courseId?.name,
        description: c.courseId?.description,
        progress: c.progress,
        completed: c.completed,
        enrollmentDate: c.enrollmentDate,
        lastAccessed: c.lastAccessed
      })),
      stats: {
        totalCourses: user.enrolledCourses.length,
        completedCourses: user.enrolledCourses.filter(c => c.completed).length,
        totalPoints: user.points,
        badgesCount: user.badges.length
      }
    };
    
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all students (admin only)
router.get('/all', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('studentId name email grade major points createdAt')
      .sort({ createdAt: -1 });
    res.json({ 
      count: students.length,
      students 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
