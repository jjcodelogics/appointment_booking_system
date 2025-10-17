// /public/js/components/UserDashboard.js
import React, { useState, useEffect } from 'react';
import * as api from '../api.js';

const UserDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const data = await api.getMyAppointments();
                setAppointments(data);
            } catch (err) {
                setError('Could not fetch appointments. You may need to log in.');
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    const handleCancel = async (id) => {
        if(window.confirm('Are you sure you want to cancel this appointment?')) {
            try {
                await api.cancelAppointment(id);
                setAppointments(appointments.filter(a => a.appointment_id !== id));
            } catch (err) {
                setError('Failed to cancel appointment.');
            }
        }
    };

    const handleBook = () => {
        // Replace this with your booking logic or navigation
        window.location.href = '/book.html'; // Or open a booking modal
    };

    if (loading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div className="error-message">{error}</div>;
    }
    return (
        <div className="container">
            <h1>My Appointments</h1>
            {appointments.length === 0 ? (
                <div>
                    <p>You have no bookings yet.</p>
                    <button className="btn btn-primary" onClick={handleBook}>
                        Click here to make your first appointment
                    </button>
                </div>
            ) : (
                <div className="card">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map(app => (
                                <tr key={app.appointment_id}>
                                    <td>{new Date(app.appointment_date).toLocaleString()}</td>
                                    <td>{app.status}</td>
                                    <td>
                                        <button className="btn" onClick={() => handleCancel(app.appointment_id)}>
                                            Cancel
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;