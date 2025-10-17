// RescheduleAppointment.js
// Assumes React is globally available and api.cdn.js exposes rescheduleAppointment(id, newDateISO)
const React = window.React;
const { useState, useEffect, createElement } = window.React;

(function () {
  const { useState } = React;

  function RescheduleAppointment() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    const [datetime, setDatetime] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    function handleChange(e) {
      setDatetime(e.target.value);
    }

    async function handleSubmit(e) {
      e.preventDefault();
      if (!datetime) {
        setMessage('Please choose a new date and time.');
        return;
      }
      setLoading(true);
      setMessage(null);
      try {
        // expected to return success/failure; adjust according to your api.cdn.js contract
        await window.api.rescheduleAppointment(id, new Date(datetime).toISOString());
        setMessage('Appointment rescheduled.');
        // redirect back to dashboard after short delay
        setTimeout(() => { window.location.href = '/dashboard.html'; }, 1000);
      } catch (err) {
        console.error(err);
        setMessage('Failed to reschedule. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    return React.createElement("div", null,
      React.createElement("h2", null, "Reschedule Appointment"),
      React.createElement("form", { onSubmit: handleSubmit },
        React.createElement("label", null, "New date & time:"),
        React.createElement("input", {
          type: "datetime-local",
          value: datetime,
          onChange: handleChange
        }),
        React.createElement("div", { style: { marginTop: '12px' } },
            React.createElement("button", {
                type: "submit",
                disabled: loading,
                className: "btn btn-primary"
            }, loading ? 'Saving...' : 'Save'),
            React.createElement("button", {
                type: "button",
                onClick: () => window.history.back(),
                className: "btn",
                style: { marginLeft: '8px' }
            }, "Cancel")
        )
      ),
      message && React.createElement("p", null, message)
    );
  }

  // Mount
  ReactDOM.render(
    React.createElement(RescheduleAppointment, null),
    document.getElementById('root')
  );
})();
