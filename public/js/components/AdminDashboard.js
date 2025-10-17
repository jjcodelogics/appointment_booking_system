// AdminDashboard.js
const React = window.React;
const { useState, useEffect, createElement } = window.React;

export default function AdminDashboard() {
  const [appointments, setAppointments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    window.api.getAllAppointments()
      .then(data => {
        setAppointments(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load appointments');
        setLoading(false);
      });
  }, []);

  async function handleDelete(id) {
    try {
      await window.api.deleteAppointmentAsAdmin(id);
      setAppointments(appointments.filter(appt => appt.appointment_id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete appointment');
    }
  }

  if (loading) {
    return React.createElement("div", null, "Loading...");
  }
  if (error) {
    return React.createElement("div", { className: "error-message" }, error);
  }

  return React.createElement(
    "div",
    { className: "container" },
    React.createElement("h1", null, "All Appointments (Admin)"),
    appointments.length === 0
      ? React.createElement("p", null, "No appointments found.")
      : React.createElement(
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
              React.createElement("th", null, "Notes"),
              React.createElement("th", null, "Actions")
            )
          ),
          React.createElement(
            "tbody",
            null,
            appointments.map(appt =>
              React.createElement(
                "tr",
                { key: appt.appointment_id },
                React.createElement("td", null, new Date(appt.appointment_date).toLocaleString()),
                React.createElement("td", null, appt.status),
                React.createElement("td", null, appt.notes || ""),
                React.createElement("td", null,
                  React.createElement("button", {
                    className: "btn btn-danger",
                    onClick: () => handleDelete(appt.appointment_id)
                  }, "Delete")
                )
              )
            )
          )
        )
  );
}