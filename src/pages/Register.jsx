import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css'; // Importing specific CSS for Register page

const Register = () => {
  const navigate = useNavigate();

  // 1. State to hold all form inputs in one object
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });

  // State for error and success messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 2. Handle input changes dynamically
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 3. Handle form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Sending data to the Spring Boot backend
      const response = await axios.post('http://localhost:8080/students', formData);
      
      console.log("Registration Success: ", response.data);
      setSuccess('Registration successful! Redirecting to login...');
      
      // Redirect to login page after 2 seconds so the user can see the success message
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err) {
      console.error("Registration Error: ", err);
      // Check if backend sent a specific error message (like duplicate email)
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to register. Please check your details and try again.');
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Student Registration</h2>
        
        {/* Display Error or Success Messages */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Full Name</label>
            <input 
              type="text" 
              name="name"
              placeholder="Enter your full name" 
              value={formData.name}
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" 
              name="email"
              placeholder="Enter your email" 
              value={formData.email}
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password"
              placeholder="Create a strong password" 
              value={formData.password}
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Phone Number</label>
            <input 
              type="text" 
              name="phone"
              placeholder="Enter your phone number" 
              value={formData.phone}
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Address</label>
            <textarea 
              name="address"
              placeholder="Enter your hostel/room address" 
              value={formData.address}
              onChange={handleChange} 
              required 
              rows="3"
            />
          </div>
          
          <button type="submit" className="register-btn">Register</button>
        </form>

        <div className="auth-links">
          <p>
            Already have an account?{' '}
            <span className="link-text" onClick={() => navigate('/')}>
              Login Here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;