// BookAppointment.js
const React = window.React;
const { useState } = window.React;

export default function BookAppointment() {
  const [form, setForm] = useState({
    appointment_date: '',
    gender: 'male',
    washing: true,
    coloring: false,
    cut: true,
    employee_name: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleChange(e) {
    const { name, type, value, checked } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  function handleGenderChange(e) {
    setForm({ ...form, gender: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await window.api.bookAppointment(form);
      setSuccess('Appointment booked!');
      // clear form
      setForm({
        appointment_date: '',
        gender: 'male',
        washing: true,
        coloring: false,
        cut: true,
        employee_name: '',
        notes: ''
      });
      // redirect to dashboard
      window.location.href = '/dashboard.html';
    } catch (err) {
      // support Error or fetch-style response
      const msg = err?.message || (err?.statusText ? `${err.status} ${err.statusText}` : 'Failed to book appointment.');
      setError(msg);
    }
  }

  return React.createElement(
    "div",
    { className: "container" },
    React.createElement("h1", null, "Book Appointment"),
    error && React.createElement("div", { className: "error-message" }, error),
    success && React.createElement("div", { className: "success-message" }, success),
    React.createElement(
      "form",
      { onSubmit: handleSubmit, className: "card", style: { maxWidth: "450px", margin: "2rem auto" } },
      React.createElement("label", null, "Date & Time"),
      React.createElement("input", {
        type: "datetime-local",
        name: "appointment_date",
        value: form.appointment_date,
        onChange: handleChange,
        required: true,
        className: "form-control"
      }),
      React.createElement("label", null, "Gender"),
      React.createElement("div", { style: { marginBottom: "1rem" } },
        React.createElement("label", null,
          React.createElement("input", {
            type: "radio",
            name: "gender",
            value: "male",
            checked: form.gender === "male",
            onChange: handleGenderChange
          }),
          " Male"
        ),
        React.createElement("label", { style: { marginLeft: "1rem" } },
          React.createElement("input", {
            type: "radio",
            name: "gender",
            value: "female",
            checked: form.gender === "female",
            onChange: handleGenderChange
          }),
          " Female"
        )
      ),
      React.createElement("div", { style: { marginBottom: "0.5rem" } },
        React.createElement("label", null, "Washing "),
        React.createElement("input", {
          type: "checkbox",
          name: "washing",
          checked: form.washing,
          onChange: handleChange,
          style: { marginLeft: "0.5rem" }
        }),
        React.createElement("label", { style: { marginLeft: "1rem" } }, "Coloring "),
        React.createElement("input", {
          type: "checkbox",
          name: "coloring",
          checked: form.coloring,
          onChange: handleChange,
          style: { marginLeft: "0.5rem" }
        }),
        React.createElement("label", { style: { marginLeft: "1rem" } }, "Cut "),
        React.createElement("input", {
          type: "checkbox",
          name: "cut",
          checked: form.cut,
          onChange: handleChange,
          style: { marginLeft: "0.5rem" }
        })
      ),
      React.createElement("label", { style: { display: "block", marginTop: "1rem" } }, "Employee Name (optional)"),
      React.createElement("input", {
        type: "text",
        name: "employee_name",
        value: form.employee_name,
        onChange: handleChange,
        className: "form-control"
      }),
      React.createElement("label", null, "Notes"),
      React.createElement("input", {
        type: "text",
        name: "notes",
        value: form.notes,
        onChange: handleChange,
        className: "form-control"
      }),
      React.createElement("button", { type: "submit", className: "btn btn-primary", style: { marginTop: "1rem" } }, "Book")
    )
  );
}