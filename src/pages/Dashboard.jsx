import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import './Dashboard.css'; 

const Dashboard = () => {
  const navigate = useNavigate();
  
  // State variables for student profile, subscription, and menu
  const [studentData, setStudentData] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [todayMenu, setTodayMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State variables for handling new plan purchases
  const [availablePlans, setAvailablePlans] = useState([]);
  const [processingPayment, setProcessingPayment] = useState(false);

  // State variable for special daily mess messages (e.g., Pure Veg days)
  const [dayMessage, setDayMessage] = useState('');

  // Function to fetch all necessary dashboard data on component mount
  const fetchDashboardData = async (parsedStudent) => {
    try {
      // 1. Check if the student currently has an active subscription
      const subResponse = await axios.get(`https://mess-management-backend-production.up.railway.app/subscriptions/student/${parsedStudent.id}`);
      
      if (subResponse.data && subResponse.data.length > 0) {
        // If subscriptions exist, extract the most recent one
        const latestSub = subResponse.data[subResponse.data.length - 1];
        setSubscription(latestSub);

        // ==========================================
        // SMART MENU LOGIC (Updated Schedule)
        // ==========================================
        const planType = latestSub.messPlan.type; 
        
        // Get current day: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
        const currentDay = new Date().getDay();
        
        // Define exact Non-Veg days: Sunday (0), Tuesday (2), Wednesday (3), Friday (5)
        const nonVegDays = [0, 2, 3, 5];
        const isNonVegDay = nonVegDays.includes(currentDay); 
        
        let menuToFetch = planType;
        let msg = "";

        // Logic strictly for Non-Veg plan holders
        if (planType === 'NON_VEG') {
            if (!isNonVegDay) {
                // If it's Mon, Thu, or Sat -> Force fetch the VEG menu
                menuToFetch = 'VEG'; 
                msg = "🌱 Today is a Pure Veg day for all students!";
            } else {
                // If it's Tue, Wed, Fri, or Sun -> Fetch Non-Veg menu
                msg = "🍗 Today is your Non-Veg Special day!";
            }
        }
        
        // Save the message to state
        setDayMessage(msg);

        try {
          // ==========================================
          // THE BULLETPROOF FIX: Bypass Java Timezone issues
          // Fetch all menus and let React pick the latest matching one
          // ==========================================
          const menuResponse = await axios.get(`https://mess-management-backend-production.up.railway.app/menu/all`);
          const allMenus = menuResponse.data;
          
          if (allMenus && Array.isArray(allMenus) && allMenus.length > 0) {
              // Reverse the list to get the most recently added menu first,
              // then find the one that matches our required planType (e.g., 'VEG')
              const foundMenu = allMenus.reverse().find(m => m.planType === menuToFetch);
              
              if (foundMenu && foundMenu.lunch) {
                  setTodayMenu(foundMenu);
              } else {
                  setTodayMenu(null);
              }
          } else {
              setTodayMenu(null);
          }
        } catch (menuErr) {
          console.error("Failed to fetch menu:", menuErr);
          setTodayMenu(null); 
        }
        // ==========================================

      } else {
        // 2. If no active plan exists, fetch the list of available plans to display
        setSubscription(null);
        const plansResponse = await axios.get('https://mess-management-backend-production.up.railway.app/plans');
        setAvailablePlans(plansResponse.data);
      }
      setLoading(false);
    } catch (err) {
      console.error("Dashboard API Error: ", err);
      setError("Failed to load dashboard data. Please try again later.");
      setLoading(false);
    }
  };

  // Initialize the component by checking local storage for an active session
  useEffect(() => {
    const storedStudent = localStorage.getItem('student');
    if (!storedStudent) {
      // Redirect to login if no active session is found
      navigate('/');
      return;
    }
    const parsedStudent = JSON.parse(storedStudent);
    setStudentData(parsedStudent);
    fetchDashboardData(parsedStudent);
  }, [navigate]);

  // Function to handle the mock payment and plan enrollment flow
  const handlePurchasePlan = async (planId, planName) => {
    if(window.confirm(`Do you want to proceed to secure payment for the ${planName}?`)) {
      setProcessingPayment(true);
      
      // Simulate a network delay for a payment gateway (e.g., Razorpay/Stripe)
      setTimeout(async () => {
        try {
          // Call the backend API to assign the plan to the student
          await axios.post(`https://mess-management-backend-production.up.railway.app/subscriptions/join?studentId=${studentData.id}&planId=${planId}`);
          
          alert("Payment Successful! 🎉 Your mess plan is now active.");
          
          // Reset states and refresh dashboard to generate the QR code
          setProcessingPayment(false);
          setLoading(true);
          fetchDashboardData(studentData); 
          
        } catch (err) {
          alert("Payment failed or server error occurred. Please try again.");
          setProcessingPayment(false);
        }
      }, 2000); 
    }
  };

  // Function to clear session and log the user out
  const handleLogout = () => {
    localStorage.removeItem('student'); 
    navigate('/'); 
  };

  return (
    <div className="dashboard-container">
      
      <div className="dashboard-header">
        <h2>Welcome, {studentData?.name || 'Student'}! 👋</h2>
        <p>This is your digital mess dashboard.</p>
      </div>

      {loading && <p className="status-text">Loading your mess details... ⏳</p>}
      {error && <p className="error-message">{error}</p>}
      
      {/* Payment Processing Overlay */}
      {processingPayment && (
        <div className="payment-overlay">
          <div className="payment-box">
            <h3>Processing Payment... 💳</h3>
            <p>Please do not refresh or close the page.</p>
          </div>
        </div>
      )}

      {/* Render active subscription details, QR code, and menu if the student has a plan */}
      {!loading && subscription && !processingPayment && (
        <>
          <div className="dashboard-metrics">
            <div className="metric-card">
              <h3>My Plan</h3>
              <p className={`status-badge ${subscription.status.toLowerCase()}`}>
                {subscription.status}
              </p>
              <p className="plan-name">{subscription.messPlan.name}</p>
              <p className="validity">Valid till: {subscription.endDate}</p>
            </div>

            <div className="metric-card qr-card">
              <h3>Digital Meal Pass</h3>
              <div className="qr-wrapper">
                <QRCodeCanvas 
                  value={subscription.id.toString()} 
                  size={120} 
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"H"}
                />
              </div>
              <p className="qr-instruction">Show this at the counter to get your meal</p>
            </div>

            <div className="metric-card">
              <h3>Meals Left</h3>
              <h1 className="meal-count">
                {subscription.remainingMeals} <span className="total-meals">/ {subscription.totalMeals}</span>
              </h1>
              <p className="validity">Status: {subscription.remainingMeals > 0 ? "Meals Available" : "Exhausted"}</p>
            </div>
          </div>

          <div className="menu-section">
            <h3 className="section-title">Today's Menu ({subscription.messPlan.type})</h3>
            
            {/* DISPLAY THE CUSTOM DAY MESSAGE HERE (Always visible if applicable) */}
            {dayMessage && (
                <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '10px 15px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', border: '1px solid #bbf7d0' }}>
                    {dayMessage}
                </div>
            )}

            {/* Display the actual menu, or a fallback message if not yet updated by admin */}
            {todayMenu ? (
              <div className="menu-cards-container">
                <div className="meal-box lunch-box">
                  <h4>☀️ Lunch</h4>
                  <p>{todayMenu.lunch || 'Not set'}</p>
                </div>
                <div className="meal-box dinner-box">
                  <h4>🌙 Dinner</h4>
                  <p>{todayMenu.dinner || 'Not set'}</p>
                </div>
              </div>
            ) : (
              <div className="no-menu-box">
                <p>The admin has not updated the menu for today yet. Check back later!</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Render the purchase section if the student does not have an active plan */}
      {!loading && !subscription && !processingPayment && !error && (
        <div className="purchase-section">
          <div className="no-plan-header">
            <h3>No Active Plan Found 😢</h3>
            <p>Select a mess plan below to start enjoying your daily meals!</p>
          </div>
          
          <div className="plans-grid">
            {availablePlans.length > 0 ? (
              availablePlans.map((plan) => (
                <div className="plan-card" key={plan.id}>
                  <div className="plan-card-header">
                    <h4>{plan.name}</h4>
                    <span className="plan-type-badge">{plan.type === 'VEG' ? '🟢 Veg' : '🔴 Non-Veg'}</span>
                  </div>
                  <div className="plan-price">
                    <h2>₹{plan.price}</h2>
                    <p>per month ({plan.totalMeals} meals)</p>
                  </div>
                  <ul className="plan-features">
                    <li>✔️ Daily Lunch & Dinner</li>
                    {plan.type === 'NON_VEG' && <li>🍗 Non-Veg on {plan.nonVegDays || 'Selected Days'}</li>}
                    <li>✔️ Digital QR Access</li>
                  </ul>
                  <button 
                    className="buy-btn"
                    onClick={() => handlePurchasePlan(plan.id, plan.name)}
                  >
                    Proceed to Pay
                  </button>
                </div>
              ))
            ) : (
              <p>No plans are currently available. Please contact administration.</p>
            )}
          </div>
        </div>
      )}

      <button className="logout-btn" onClick={handleLogout} style={{marginTop: '30px'}}>
        Logout
      </button>

    </div>
  );
};

export default Dashboard;