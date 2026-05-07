import { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentTable.css'; 

const StudentTable = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // States for the Edit Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [editFormData, setEditFormData] = useState({
        remainingMeals: 0,
        status: 'ACTIVE'
    });

    const fetchStudents = async () => {
        try {
            const response = await axios.get('http://localhost:8080/students?page=0&size=50');
            const studentsList = response.data.data;

            const studentsWithPlans = await Promise.all(studentsList.map(async (student) => {
                try {
                    const subRes = await axios.get(`http://localhost:8080/subscriptions/student/${student.id}`);
                    const subs = subRes.data;
                    
                    if (subs && subs.length > 0) {
                        const latestSub = subs[subs.length - 1]; 
                        return {
                            ...student,
                            subId: latestSub.id, // Store subscription ID for updating later
                            status: latestSub.status, 
                            planType: latestSub.messPlan.type,
                            remainingMeals: latestSub.remainingMeals
                        };
                    }
                    return { ...student, subId: null, status: 'INACTIVE', planType: 'N/A', remainingMeals: 0 };
                } catch (err) {
                    return { ...student, subId: null, status: 'INACTIVE', planType: 'N/A', remainingMeals: 0 };
                }
            }));

            setStudents(studentsWithPlans);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching student directory:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this student? Active plans cannot be deleted.")) {
            try {
                const res = await axios.delete(`http://localhost:8080/students/${id}`);
                alert(res.data); 
                fetchStudents(); 
            } catch (error) {
                alert("Error deleting student from the database!");
            }
        }
    };

    // Open Modal and populate data
    const handleEditClick = (student) => {
        if (student.status === 'INACTIVE') {
            alert("This student does not have an active plan to edit.");
            return;
        }
        setSelectedStudent(student);
        setEditFormData({
            remainingMeals: student.remainingMeals,
            status: student.status
        });
        setIsModalOpen(true);
    };

    // Handle form submission inside the modal
   // Handle form submission inside the modal
    const handleUpdateSubscription = async (e) => {
        e.preventDefault();
        
        try {
            // Call the Spring Boot PUT API we just created
            await axios.put(`http://localhost:8080/subscriptions/update/${selectedStudent.subId}`, {
                remainingMeals: editFormData.remainingMeals.toString(),
                status: editFormData.status
            });

            alert("Subscription updated successfully! ✅");
            
            setIsModalOpen(false); // Close the popup
            fetchStudents();       // Refresh the table to show updated data
            
        } catch (error) {
            console.error("Error updating subscription:", error);
            alert("Failed to update subscription. Please try again.");
        }
    };

    if (loading) return <div className="loading-text">Loading Student Directory... ⏳</div>;

    return (
        <div className="table-container">
            <div className="table-header-section">
                <h3 className="table-title">👨‍🎓 Student Management Directory</h3>
                <p className="table-subtitle">View, edit, and manage registered students and their active plans</p>
            </div>
            
            <div className="table-responsive">
                <table className="student-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Plan Type</th>
                            <th>Status</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length > 0 ? (
                            students.map((student) => (
                                <tr key={student.id}>
                                    <td className="student-id">#{student.id}</td>
                                    <td className="student-name">{student.name}</td>
                                    <td>{student.phone}</td>
                                    <td className="font-bold">
                                        {student.planType === 'VEG' ? '🟢 Veg' : student.planType === 'NON_VEG' ? '🔴 Non-Veg' : '⚪ N/A'}
                                    </td>
                                    <td>
                                        <span className={`status-badge-table ${student.status.toLowerCase()}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="action-buttons">
                                        <button 
                                            className="action-btn edit-btn"
                                            onClick={() => handleEditClick(student)}
                                        >
                                            Manage Plan
                                        </button>
                                        <button 
                                            className="action-btn delete-btn"
                                            onClick={() => handleDelete(student.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="no-data-text">No students found in the database.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Subscription Modal Overlay */}
            {isModalOpen && selectedStudent && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Manage Subscription</h3>
                        <p className="modal-student-name">Student: <strong>{selectedStudent.name}</strong></p>
                        
                        <form onSubmit={handleUpdateSubscription}>
                            <div className="modal-input-group">
                                <label>Adjust Remaining Meals</label>
                                <input 
                                    type="number" 
                                    value={editFormData.remainingMeals}
                                    onChange={(e) => setEditFormData({...editFormData, remainingMeals: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div className="modal-input-group">
    <label>Subscription Status</label>
    <select 
        value={editFormData.status}
        onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
    >
        <option value="ACTIVE">ACTIVE</option>
        <option value="GRACE_PERIOD">GRACE_PERIOD (10 extra days)</option>
        <option value="EXPIRED">EXPIRED</option>
    </select>
</div>

                            <div className="modal-action-buttons">
                                <button type="button" className="modal-cancel-btn" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="modal-save-btn">
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

export default StudentTable;