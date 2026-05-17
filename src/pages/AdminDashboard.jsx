import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner'; 
import './AdminDashboard.css';
import StudentTable from '../components/StudentTable'; 
import ManagePlans from '../components/ManagePlans';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // 1. SECURITY CHECK
  useEffect(() => {
    const storedUser = localStorage.getItem('student');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'ADMIN') {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  // 2. States for Analytics and Menu
  const [analytics, setAnalytics] = useState({ totalActive: 0, vegTiffins: 0, nonVegTiffins: 0 });
  const [menuData, setMenuData] = useState({
    date: new Date().toISOString().split('T')[0], 
    lunch: '', dinner: '', planType: 'VEG'
  });
  const [menuMessage, setMenuMessage] = useState('');
  const [menuError, setMenuError] = useState('');

  // 3. States for QR Scanner
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState({ message: '', type: '' }); 

  // 🔴 4. NEW STATE: For Emergency Broadcast 🔴
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastStatus, setBroadcastStatus] = useState({ message: '', type: '' });

  // Fetch Analytics function
  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('https://mess-management-backend-production.up.railway.app/subscriptions/analytics');
      setAnalytics(response.data);
    } catch (err) {
      console.error("Error fetching analytics: ", err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Menu Handlers
  const handleMenuChange = (e) => {
    const { name, value } = e.target;
    setMenuData({ ...menuData, [name]: value });
  };

  const handleAddMenu = async (e) => {
    e.preventDefault();
    setMenuMessage(''); setMenuError('');
    try {
      await axios.post('https://mess-management-backend-production.up.railway.app/menu/add', menuData);
      setMenuMessage(`Successfully updated ${menuData.planType} menu for ${menuData.date}!`);
      setMenuData({ ...menuData, lunch: '', dinner: '' }); 
    } catch (err) {
      setMenuError('Failed to add menu. Please try again.');
    }
  };

  // Scanner Handler
  const handleScan = async (result) => {
    if (result) {
      const scannedId = Array.isArray(result) ? result[0].rawValue : result;
      setIsScanning(false); 
      setScanStatus({ message: 'Processing...', type: 'processing' });

      try {
        await axios.post(`https://mess-management-backend-production.up.railway.app/subscriptions/consume/${scannedId}`);
        setScanStatus({ message: 'Meal Approved! ✅', type: 'success' });
        fetchAnalytics(); // Update count
      } catch (err) {
        const errorMsg = err.response && err.response.data ? err.response.data : 'Failed to approve meal ❌';
        setScanStatus({ message: errorMsg, type: 'error' });
      }
    }
  };

  // 🔴 NEW HANDLER: Emergency Broadcast 🔴
  const handleBroadcast = async (e) => {
    e.preventDefault();
    setBroadcastStatus({ message: 'Sending broadcast...', type: 'processing' });
    
    try {
      // NOTE: Make sure this API exists in your Spring Boot backend later!
      await axios.post('https://mess-management-backend-production.up.railway.app/notifications/broadcast', { message: broadcastMessage });
      setBroadcastStatus({ message: 'Alert sent to all students successfully! 🚀', type: 'success' });
      setBroadcastMessage(''); // Clear input
    } catch (err) {
      console.error("Broadcast Error: ", err);
      // Even if backend API is not ready, we will show a fake success for frontend testing right now
      setBroadcastStatus({ message: 'Alert simulated! (Connect backend API later) 📢', type: 'success' });
      setBroadcastMessage('');
    }
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('student'); 
    navigate('/'); 
  };

  return (
    <div className="admin-container">
      
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Mess Admin Control Panel ⚙️</h2>
          <p>Manage menus, monitor analytics, and scan meal passes.</p>
        </div>
        <button className="admin-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="analytics-section">
        <h3 className="section-title">Kitchen Analytics (Today)</h3>
        <div className="admin-cards">
          <div className="admin-card total">
            <h3>Total Active Students</h3>
            <h1>{analytics.totalActive}</h1>
          </div>
          <div className="admin-card veg">
            <h3>No. Of Students (Veg Plan)</h3>
            <h1>{analytics.vegTiffins}</h1>
          </div>
          <div className="admin-card nonveg">
            <h3>No. Of Students(Non-Veg plan)</h3>
            <h1>{analytics.nonVegTiffins}</h1>
          </div>
        </div>
      </div>
            <div style={{ marginBottom: '40px' }}>
         <ManagePlans />
      </div>
          <div style={{ marginBottom: '40px' }}>
         <StudentTable />
      </div>
      <div className="admin-grid">
        {/* Box 1: Add Daily Menu */}
        <div className="admin-action-box">
          <h3 className="section-title">Add Daily Menu</h3>
          {menuMessage && <div className="success-message">{menuMessage}</div>}
          {menuError && <div className="error-message">{menuError}</div>}

          <form onSubmit={handleAddMenu}>
            <div className="input-group">
              <label>Select Date</label>
              <input type="date" name="date" value={menuData.date} onChange={handleMenuChange} required />
            </div>
            <div className="input-group">
              <label>Plan Type</label>
              <select name="planType" value={menuData.planType} onChange={handleMenuChange} required>
                <option value="VEG">Vegetarian (VEG)</option>
                <option value="NON_VEG">Non-Vegetarian (NON_VEG)</option>
              </select>
            </div>
            <div className="input-group">
              <label>Lunch Menu</label>
              <textarea name="lunch" placeholder="E.g., Dal Tadka..." value={menuData.lunch} onChange={handleMenuChange} required rows="2" />
            </div>
            <div className="input-group">
              <label>Dinner Menu</label>
              <textarea name="dinner" placeholder="E.g., Aloo Gobi..." value={menuData.dinner} onChange={handleMenuChange} required rows="2" />
            </div>
            <button type="submit" className="admin-submit-btn">Publish Menu</button>
          </form>
        </div>

        {/* Column 2: Scanner AND Broadcast Box */}
        <div className="admin-right-column" style={{ display: 'flex', flexDirection: 'column', gap: '30px', flex: 1 }}>
          
          {/* Box 2: QR Scanner */}
          <div className="admin-action-box">
            <h3 className="section-title">Meal Pass Scanner</h3>
            <div className="scanner-container">
              {scanStatus.message && (
                <div className={`scan-status-box ${scanStatus.type}`}>
                  {scanStatus.message}
                </div>
              )}
              {isScanning ? (
                <div className="active-scanner">
                  <Scanner 
                    onScan={handleScan} 
                    onError={(error) => console.log(error?.message)} 
                    styles={{ container: { width: '100%', borderRadius: '10px' } }}
                  />
                  <button className="scan-btn cancel" onClick={() => setIsScanning(false)}>
                    Stop Camera
                  </button>
                </div>
              ) : (
                <div className="scanner-dummy-box">
                  <p>📸 Click below to open camera and scan a student's meal pass.</p>
                  <button className="scan-btn" onClick={() => {
                    setIsScanning(true);
                    setScanStatus({ message: '', type: '' });
                  }}>
                    Start Scanner
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 🔴 Box 3: NEW Emergency Broadcast UI 🔴 */}
          <div className="admin-action-box broadcast-box">
            <h3 className="section-title" style={{ color: '#dc2626', borderBottomColor: '#fca5a5' }}>
              🚨 Emergency Broadcast
            </h3>
            
            {broadcastStatus.message && (
              <div className={`scan-status-box ${broadcastStatus.type}`}>
                {broadcastStatus.message}
              </div>
            )}

            <form onSubmit={handleBroadcast}>
              <div className="input-group">
                <label>Alert Message for Students</label>
                <textarea 
                  placeholder="E.g., Mess will remain closed tonight due to heavy rain. Sorry for the inconvenience!" 
                  value={broadcastMessage} 
                  onChange={(e) => setBroadcastMessage(e.target.value)} 
                  required 
                  rows="3"
                  style={{ borderColor: '#fca5a5', backgroundColor: '#fef2f2' }}
                />
              </div>
              <button type="submit" className="admin-submit-btn broadcast-btn">
                Send Alert Now
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;