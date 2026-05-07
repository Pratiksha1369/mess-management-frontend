import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login'; // Importing our newly created Login page
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';

const App = () => {
  return (
    // 1. Router wraps the entire app to enable navigation
    <Router>
      
      {/* 2. Routes acts like a switch, looking for the exact URL match */}
      <Routes>
        
        {/* 3. When the URL is exactly '/' (home), show the Login component */}
        <Route path="/" element={<Login />} />
        
        
            <Route path="/dashboard" element={<Dashboard />} /> 
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
        
      </Routes>
    </Router>
  );
};

export default App;