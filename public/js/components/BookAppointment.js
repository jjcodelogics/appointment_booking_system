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
    notes: ''
  });
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, type, value, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setForm(prevForm => ({ ...prevForm, [name]: newValue }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await window.api.bookAppointment(form);
      // Feedback is handled on the dashboard page via a query parameter.
      window.location.href = '/dashboard.html?booked=true';
    } catch (err) {
      const msg = err?.message || (err?.statusText ? `${err.status} ${err.statusText}` : 'Failed to book appointment.');
      setError(msg);
    }
  }

  return React.createElement(
    "div",
    { className: "container" },
    React.createElement("h1", null, "Book Appointment"),
    error && React.createElement("div", { className: "alert alert-danger" }, error),
    React.createElement(
      "form",
      { onSubmit: handleSubmit, className: "card p-3", style: { maxWidth: "450px", margin: "2rem auto" } },
      React.createElement("label", { htmlFor: "appointment_date" }, "Date & Time"),
      React.createElement("input", {
        id: "appointment_date",
        type: "datetime-local",
        name: "appointment_date",
        value: form.appointment_date,
        onChange: handleChange,
        required: true,
        className: "form-control"
      }),
      React.createElement("label", { className: "mt-3" }, "Gender"),
      React.createElement("div", { style: { marginBottom: "1rem" } },
        React.createElement("label", { className: "me-3" },
          React.createElement("input", {
            type: "radio",
            name: "gender",
            value: "male",
            checked: form.gender === "male",
            onChange: handleChange // Use the generic handler
          }),
          " Male"
        ),
        React.createElement("label", null,
          React.createElement("input", {
            type: "radio",
            name: "gender",
            value: "female",
            checked: form.gender === "female",
            onChange: handleChange // Use the generic handler
          }),
          " Female"
        )
      ),
      React.createElement("div", { className: "mb-2" },
        React.createElement("label", { className: "me-3" },
          React.createElement("input", {
            type: "checkbox",
            name: "washing",
            checked: form.washing,
            onChange: handleChange
          }),
          " Washing"
        ),
        React.createElement("label", { className: "me-3" },
          React.createElement("input", {
            type: "checkbox",
            name: "coloring",
            checked: form.coloring,
            onChange: handleChange
          }),
          " Coloring"
        ),
        React.createElement("label", null,
          React.createElement("input", {
            type: "checkbox",
            name: "cut",
            checked: form.cut,
            onChange: handleChange
          }),
          " Cut"
        )
      ),
      React.createElement("label", { htmlFor: "notes", className: "mt-3" }, "Notes"),
      React.createElement("input", {
        id: "notes",
        type: "text",
        name: "notes",
        value: form.notes,
        onChange: handleChange,
        className: "form-control"
      }),
      React.createElement("button", { type: "submit", className: "btn btn-primary mt-3" }, "Book")
    )
  );
}