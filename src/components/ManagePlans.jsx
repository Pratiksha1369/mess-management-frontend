import { useState, useEffect } from 'react';
import axios from 'axios';
import './ManagePlans.css';

const ManagePlans = () => {
    // State to hold the list of mess plans from the database
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // States for handling the Edit Plan Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        price: '',
        totalMeals: '',
        type: ''
    });

    // Function to fetch all plans from the backend
    const fetchPlans = async () => {
        try {
            const response = await axios.get('https://mess-management-backend-production.up.railway.app/plans');
            setPlans(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching mess plans:", error);
            setLoading(false);
        }
    };

    // Fetch plans when the component mounts
    useEffect(() => {
        fetchPlans();
    }, []);

    // Open the edit modal and populate it with the selected plan's current data
    const handleEditClick = (plan) => {
        setSelectedPlan(plan);
        setEditFormData({
            name: plan.name,
            price: plan.price,
            totalMeals: plan.totalMeals,
            type: plan.type
        });
        setIsEditModalOpen(true);
    };

    // Handle form submission to update the plan in the database
    const handleUpdatePlan = async (e) => {
        e.preventDefault();
        try {
            // Make the PUT request to the existing Spring Boot API
            await axios.put(`https://mess-management-backend-production.up.railway.app/plans/${selectedPlan.id}`, {
    ...editFormData,
    price: Number(editFormData.price),
    totalMeals: Number(editFormData.totalMeals)
});
            
            alert("Plan updated successfully! 🎉 New prices will apply to new subscriptions.");
            
            // Close the modal and refresh the plans list
            setIsEditModalOpen(false);
            fetchPlans();
        } catch (error) {
            console.error("Error updating plan:", error);
            alert("Failed to update the plan. Please check the console for details.");
        }
    };

    if (loading) return <div className="loading-text">Loading Plans... ⏳</div>;

    return (
        <div className="manage-plans-container">
            <div className="plans-header">
                <h3>💼 Manage Mess Plans & Pricing</h3>
                <p>Update subscription prices. Changes only affect new purchases.</p>
            </div>

            <div className="plans-grid-admin">
                {plans.map((plan) => (
                    <div className="admin-plan-card" key={plan.id}>
                        <div className="plan-card-top">
                            <h4>{plan.name}</h4>
                            <span className={`badge ${plan.type.toLowerCase()}`}>
                                {plan.type === 'VEG' ? '🟢 Veg' : '🔴 Non-Veg'}
                            </span>
                        </div>
                        <div className="plan-card-price">
                            <h2>₹{plan.price}</h2>
                            <p>For {plan.totalMeals} Meals</p>
                        </div>
                        <button 
                            className="edit-price-btn"
                            onClick={() => handleEditClick(plan)}
                        >
                            ✏️ Edit Plan Details
                        </button>
                    </div>
                ))}
            </div>

            {/* Edit Plan Modal Overlay */}
            {isEditModalOpen && selectedPlan && (
                <div className="plan-modal-overlay">
                    <div className="plan-modal-content">
                        <h3>Edit Mess Plan</h3>
                        <p className="modal-subtitle">Updating: <strong>{selectedPlan.name}</strong></p>
                        
                        <form onSubmit={handleUpdatePlan}>
                            <div className="plan-input-group">
                                <label>Plan Name</label>
                                <input 
                                    type="text" 
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div className="plan-input-group">
                                <label>Price (₹)</label>
                                <input 
                                    type="number" 
                                    value={editFormData.price}
                                    onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="plan-input-group">
                                <label>Total Meals (Validity)</label>
                                <input 
                                    type="number" 
                                    value={editFormData.totalMeals}
                                    onChange={(e) => setEditFormData({...editFormData, totalMeals: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="plan-modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setIsEditModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagePlans;