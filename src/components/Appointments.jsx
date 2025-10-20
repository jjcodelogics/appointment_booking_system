import React, { useEffect, useState } from 'react';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    window.api.getAllAppointments()
      .then((data) => setAppointments(data))
      .catch((error) => console.error('Error fetching appointments:', error));
  }, []);

  return (
    <div>
      <h2>All Appointments</h2>
      <ul>
        {appointments.map((appointment) => (
          <li key={appointment.id}>{appointment.date} - {appointment.clientName}</li>
        ))}
      </ul>
    </div>
  );
};

export default Appointments;