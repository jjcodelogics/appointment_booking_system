// /public/js/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import * as api from '../api.js';

const AdminDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const data = await api.getAllAppointments();
                setAppointments(data);
            } catch (err) {
                setError('Access denied or failed to fetch data. Are you logged in as an admin?');
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    React.useEffect(() => {
        window.api.getMyAppointments()
            .then(data => {
            console.log('Appointments:', data); // Add this line
            setAppointments(data);
            setLoading(false);
        })
            .catch(err => {
            setError(err.message || 'Failed to load appointments');
            setLoading(false);
        });
    }, []);

    const handleDelete = async (id) => {
        if(window.confirm('Are you sure you want to delete this appointment permanently?')) {
            try {
                await api.deleteAppointmentAsAdmin(id);
                setAppointments(appointments.filter(a => a.appointment_id !== id));
            } catch (err) {
                setError('Failed to delete appointment.');
            }
        }
    };
    
    if (loading) return <p>Loading all appointments...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="container">
            <h1>Admin Dashboard: All Appointments</h1>
            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map(app => (
                            <tr key={app.appointment_id}>
                                <td>{app.user_id}</td>
                                <td>{new Date(app.appointment_date).toLocaleString()}</td>
                                <td>{app.status}</td>
                                <td>
                                    <button className="btn" onClick={() => handleDelete(app.appointment_id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;