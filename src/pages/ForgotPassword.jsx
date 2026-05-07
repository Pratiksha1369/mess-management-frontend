import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css'; // Importing the dedicated CSS file

const ForgotPassword = () => {
  const navigate = useNavigate();

  // State variables for form inputs
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // State to manage which step of the process we are on (1 = Request OTP, 2 = Verify OTP)
  const [step, setStep] = useState(1);
  
  // State for messages
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Function to request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      // Calling backend to send OTP. Note: Backend expects @RequestParam, so we use params.
      const response = await axios.post(`http://localhost:8080/students/forgot-password?email=${email}`);
      
      if (response.data.includes('SUCCESS')) {
        setMessage('OTP has been sent to your email.');
        setStep(2); // Move to the next step
      } else {
        setError(response.data); // Show backend error (e.g., email not found)
      }
    } catch (err) {
      console.error("OTP Error: ", err);
      setError('Failed to send OTP. Please try again.');
    }
  };

  // Function to verify OTP and reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      // Calling backend to reset password using URL parameters
      const response = await axios.post(`http://localhost:8080/students/reset-password?email=${email}&otp=${otp}&newPassword=${newPassword}`);
      
      if (response.data.includes('SUCCESS')) {
        setMessage('Password reset successfully! Redirecting to login...');
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(response.data); // Show error (e.g., Invalid OTP)
      }
    } catch (err) {
      console.error("Reset Error: ", err);
      setError('Failed to reset password. Please check your OTP.');
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <h2>Reset Password</h2>
        
        {/* Display feedback messages */}
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        {/* Step 1: Ask for Email to send OTP */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div className="input-group">
              <label>Registered Email</label>
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="forgot-btn">Send OTP</button>
          </form>
        )}

        {/* Step 2: Ask for OTP and New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <div className="input-group">
              <label>Enter OTP</label>
              <input 
                type="text" 
                placeholder="6-digit OTP" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)} 
                required 
              />
            </div>
            <div className="input-group">
              <label>New Password</label>
              <input 
                type="password" 
                placeholder="Enter new password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="forgot-btn">Reset Password</button>
          </form>
        )}

        {/* Navigation link back to Login */}
        <div className="auth-links">
          <p>
            Remembered your password?{' '}
            <span className="link-text" onClick={() => navigate('/')}>
              Login Here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;