// UserDashboardComponent.js
const React = window.React;
const { useState, useEffect, createElement } = window.React;

export default function UserDashboardComponent() {
  const [appointments, setAppointments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [user, setUser] = React.useState(null);
  const [bookedSlots, setBookedSlots] = React.useState([]);
  const [successMessage, setSuccessMessage] = React.useState('');

  React.useEffect(() => {
    // Check for success message from booking redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get('booked') === 'true') {
      setSuccessMessage('Appointment booked successfully!');
      // Clean the URL
      window.history.replaceState({}, document.title, "/dashboard.html");
    }

    // Fetch user info
    window.api.getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));

    // Fetch user's appointments
    window.api.getMyAppointments()
      .then(setAppointments)
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));

    // Fetch all booked slots
    window.api.getAllBookedSlots()
      .then(setBookedSlots)
      .catch(() => setBookedSlots([]));
  }, []);

  const handleBook = () => {
    window.location.href = '/book.html';
  };
  
  // 🔥 FIX: ADDED handleCancel to resolve the original issue
  async function handleCancel(id) {
    if(window.confirm('Are you sure you want to cancel this appointment?')) {
        try {
            // Call the API function defined in api.cdn.js
            await window.api.cancelAppointment(id);
            // Optimistically update the UI by filtering out the cancelled appointment
            setAppointments(appointments.filter(appt => appt.appointment_id !== id));
        } catch (err) {
            setError(err.message || 'Failed to cancel appointment.');
        }
    }
  }

  if (loading) return React.createElement("div", null, "Loading...");
  if (error) return React.createElement("div", { className: "error-message" }, error);

  return React.createElement(
    "div",
    { className: "container" },
    user && React.createElement("h2", null, `Welcome, ${user.name}!`),
    successMessage && React.createElement("div", { className: "alert alert-success" }, successMessage),
    React.createElement("div", { className: "actions-right" },
      React.createElement("button", { className: "btn btn-primary", onClick: handleBook }, "Book New Appointment")
    ),
    React.createElement("h3",  { style: { marginTop: '3.5rem' } }, null, "My Appointments"),
    appointments.length === 0
      ? React.createElement("p", null, "You have no bookings yet.")
      : React.createElement(
          "div",
          { className: "card" },
          React.createElement(
            "table",
            null,
            React.createElement(
              "thead",
              null,
              React.createElement(
                "tr",
                null,
                React.createElement("th", null, "Date"),
                React.createElement("th", null, "Status"),
                React.createElement("th", null, "Actions")
              )
            ),
  
            React.createElement(
              "tbody",
              null,
              appointments.map(app =>
                React.createElement(
                  "tr",
                  { key: app.appointment_id },
                  React.createElement("td", null, new Date(app.appointment_date).toLocaleString()),
                  React.createElement("td", null, app.status),
                  React.createElement("td", null,
                    // Cancel button (existing)
                    React.createElement("button", {
                      className: "btn",
                      onClick: () => handleCancel(app.appointment_id)
                    }, "Cancel"),
                    // Spacer
                    React.createElement("span", { style: { display: "inline-block", width: "8px" } }),
                    // Change (reschedule) button (new)
                    React.createElement("button", {
                      className: "btn",
                      onClick: () => { window.location.href = `/reschedule.html?id=${app.appointment_id}`; }
                    }, "Change")
                  )
                )
              )
            )

          )
        )
  );
}