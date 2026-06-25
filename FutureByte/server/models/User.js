const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Authentication fields
  googleId: { type: String, sparse: true },
  email: { type: String },
  password: { type: String },
  
  // Student profile
  name: { type: String, required: true },
  avatar: { type: String },
  
  // Phone number - ensure uniqueness
  phoneNumber: { type: String, unique: true, sparse: true },
  isPhoneVerified: { type: Boolean, default: false },
  
  // Student specific fields
  studentId: { type: String, unique: true, sparse: true },
  grade: { type: String, enum: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'] },
  major: { type: String },
  university: { type: String },
  enrollmentDate: { type: Date, default: Date.now },
  
  // Progress tracking
  enrolledCourses: [{ 
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    enrollmentDate: { type: Date, default: Date.now },
    lastAccessed: { type: Date, default: Date.now }
  }],
  
  // Achievements
  points: { type: Number, default: 0 },
  badges: [{ 
    name: String,
    icon: String,
    earnedDate: { type: Date, default: Date.now }
  }],
  
  // OTP fields
  otp: { type: String },
  otpExpires: { type: Date },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true },
  role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' }
});

// Generate student ID before saving
userSchema.pre('save', async function(next) {
  if (!this.studentId && this.role === 'student') {
    const year = new Date().getFullYear();
    const count = await mongoose.model('User').countDocuments({ role: 'student' });
    this.studentId = `STU${year}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Ensure unique phone number
userSchema.index({ phoneNumber: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('User', userSchema);
