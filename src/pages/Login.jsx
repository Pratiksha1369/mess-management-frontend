import { useState } from 'react';
import axios from 'axios';
import './Login.css'; 
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setError(''); 

    // 🔴 1. ADMIN LOGIN LOGIC (Updated to admin@mess.com) 🔴
    if (email.trim() === 'admin@mess.com' && password.trim() === 'admin123') {
      console.log("Admin Login Triggered");
      
      // Save Admin data in local storage
      localStorage.setItem('student', JSON.stringify({ 
        id: 'ADMIN', 
        name: 'Super Admin', 
        role: 'ADMIN' 
      }));
      
      alert('Welcome to Admin Control Panel!');
      navigate('/admin'); 
      return; // Stop execution here
    }

    // 🔵 2. STUDENT LOGIN LOGIC 🔵
    try {
      const response = await axios.post('https://mess-management-backend-production.up.railway.app/students/login', {
        email: email.trim(), 
        password: password
      });

      console.log("Student Login Success: ", response.data);
      localStorage.setItem('student', JSON.stringify(response.data)); 
      
      alert('Login Successful! Welcome ' + response.data.name);
      navigate('/dashboard'); 

    } catch (err) {
      console.error("Login Error: ", err);
      if (err.response && err.response.data) {
        // Specifically for "Invalid Email or Password" from backend
        setError(err.response.data.message || err.response.data); 
      } else {
        setError('Invalid Email or Password');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Mess Login</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          <button type="submit" className="login-btn">Login</button>
        </form>

        <div className="auth-links">
          <p>
            <span className="link-text" onClick={() => navigate('/forgot-password')}>
              Forgot Password?
            </span>
          </p>
          <p>
            New Student?{' '}
            <span className="link-text" onClick={() => navigate('/register')}>
              Register Here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;