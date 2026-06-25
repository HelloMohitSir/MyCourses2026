import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [receivedOtp, setReceivedOtp] = useState('');
  
  const { loginWithGoogle, sendOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await sendOTP(phoneNumber);
      setSuccess('OTP sent successfully!');
      
      // In development, show the OTP in the UI
      if (result.otp) {
        setReceivedOtp(result.otp);
        setStep('otp');
      } else {
        // If no OTP in response, check console
        setReceivedOtp('Check console for OTP');
        setStep('otp');
      }
    } catch (error) {
      setError(error.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await verifyOTP(phoneNumber, otp);
      navigate('/dashboard');
    } catch (error) {
      setError(error.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🚀 FutureByte</h1>
          <p>Sign in to continue learning</p>
        </div>

        <div className="login-methods">
          <button 
            className="google-btn"
            onClick={loginWithGoogle}
          >
            <span className="google-icon">G</span>
            Continue with Google
          </button>

          <div className="divider">
            <span>or</span>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSendOTP}>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
                <small>Enter phone number with country code</small>
              </div>
              
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}
              
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div className="form-group">
                <label>Enter OTP</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                  required
                  autoFocus
                />
                <small>
                  {receivedOtp && (
                    <span style={{ color: '#667eea', fontWeight: 'bold' }}>
                      📱 Your OTP: {receivedOtp}
                    </span>
                  )}
                  {!receivedOtp && 'Check your phone for the verification code'}
                </small>
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              <div className="otp-actions">
                <button 
                  type="button" 
                  className="back-btn"
                  onClick={() => setStep('phone')}
                >
                  ← Back
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="login-footer">
          <Link to="/">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
