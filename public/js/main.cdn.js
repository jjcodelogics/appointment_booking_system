// No imports, everything is in this file

function LoginRegister() {
  const [isLogin, setIsLogin] = React.useState(true);
  const [formData, setFormData] = React.useState({
    username_email: '',
    name: '',
    password: '',
  });
  const [error, setError] = React.useState('');

  function onChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await window.api.login(formData.username_email, formData.password);
        window.location.href = '/dashboard.html';
      } else {
        await window.api.register(formData.username_email, formData.name, formData.password);
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return React.createElement(
    "div",
    { className: "container" },
    React.createElement(
      "div",
      { className: "card", style: { maxWidth: "450px", margin: "3rem auto" } },
      React.createElement("h1", null, isLogin ? "Login" : "Register"),
      React.createElement(
        "form",
        { onSubmit: onSubmit },
        !isLogin &&
          React.createElement(
            "div",
            { className: "form-group" },
            React.createElement("label", { htmlFor: "name" }, "Full Name"),
            React.createElement("input", {
              type: "text",
              id: "name",
              name: "name",
              className: "form-control",
              value: formData.name,
              onChange: onChange,
              required: true,
            })
          ),
        React.createElement(
          "div",
          { className: "form-group" },
          React.createElement("label", { htmlFor: "username_email" }, "Email"),
          React.createElement("input", {
            type: "email",
            id: "username_email",
            name: "username_email",
            className: "form-control",
            value: formData.username_email,
            onChange: onChange,
            required: true,
          })
        ),
        React.createElement(
          "div",
          { className: "form-group" },
          React.createElement("label", { htmlFor: "password" }, "Password"),
          React.createElement("input", {
            type: "password",
            id: "password",
            name: "password",
            className: "form-control",
            value: formData.password,
            onChange: onChange,
            minLength: 6,
            required: true,
          })
        ),
        React.createElement(
          "button",
          {
            type: "submit",
            className: "btn btn-primary",
            style: { width: "100%" },
          },
          isLogin ? "Login" : "Create Account"
        )
      ),
      error && React.createElement("p", { className: "error-message" }, error),
      React.createElement(
        "p",
        { style: { marginTop: "1rem", textAlign: "center" } },
        isLogin ? "Don't have an account?" : "Already have an account?",
        React.createElement(
          "a",
          {
            href: "#",
            onClick: function (e) {
              e.preventDefault();
              setIsLogin(!isLogin);
            },
            style: { marginLeft: "5px" },
          },
          isLogin ? "Register" : "Login"
        )
      )
    )
  );
}

// Render logic
const loginRootEl = document.getElementById('login-register-root');
if (loginRootEl) {
  ReactDOM.createRoot(loginRootEl).render(
    React.createElement(LoginRegister)
  );
}

function UserDashboard() {
  const [appointments, setAppointments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [user, setUser] = React.useState(null);
  const [bookedSlots, setBookedSlots] = React.useState([]);

  React.useEffect(() => {
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

  if (loading) return React.createElement("div", null, "Loading...");
  if (error) return React.createElement("div", { className: "error-message" }, error);

  return React.createElement(
    "div",
    { className: "container" },
    user && React.createElement("h2", null, `Welcome, ${user.name}!`),
    React.createElement("button", { className: "btn btn-primary", onClick: handleBook, style: { marginBottom: "1rem" } }, "Book New Appointment"),
    React.createElement("h3", null, "Booked Slots Overview"),
    bookedSlots.length === 0
      ? React.createElement("p", null, "No slots booked yet.")
      : React.createElement(
          "ul",
          null,
          bookedSlots.map((slot, idx) =>
            React.createElement("li", { key: idx }, new Date(slot.appointment_date).toLocaleString())
          )
        ),
    React.createElement("h3", null, "My Appointments"),
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
                    React.createElement("button", {
                      className: "btn",
                      onClick: () => handleCancel(app.appointment_id)
                    }, "Cancel")
                  )
                )
              )
            )
          )
        )
  );
}

// Render logic for dashboard
const dashboardRootEl = document.getElementById('user-dashboard-root');
if (dashboardRootEl) {
  ReactDOM.createRoot(dashboardRootEl).render(
    React.createElement(UserDashboard)
  );
}

function AdminDashboard() {
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

// Render logic for admin dashboard
const adminDashboardRootEl = document.getElementById('admin-dashboard-root');
if (adminDashboardRootEl) {
  ReactDOM.createRoot(adminDashboardRootEl).render(
    React.createElement(AdminDashboard)
  );
}

function BookAppointment() {
  const [form, setForm] = React.useState({
    appointment_date: '',
    gender: 'male',
    washing: true,
    coloring: false,
    cut: true,
    employee_name: '',
    notes: ''
  });
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

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
      setForm({
        appointment_date: '',
        gender: 'male',
        washing: true,
        coloring: false,
        cut: true,
        employee_name: '',
        notes: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to book appointment.');
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
      React.createElement("label", null, "Washing"),
      React.createElement("input", {
        type: "checkbox",
        name: "washing",
        checked: form.washing,
        onChange: handleChange
      }),
      " Yes",
      React.createElement("label", { style: { marginLeft: "1rem" } }, "Coloring"),
      React.createElement("input", {
        type: "checkbox",
        name: "coloring",
        checked: form.coloring,
        onChange: handleChange
      }),
      " Yes",
      React.createElement("label", { style: { marginLeft: "1rem" } }, "Cut"),
      React.createElement("input", {
        type: "checkbox",
        name: "cut",
        checked: form.cut,
        onChange: handleChange
      }),
      " Yes",
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

// Render logic for booking page
const bookRootEl = document.getElementById('book-appointment-root');
if (bookRootEl) {
  ReactDOM.createRoot(bookRootEl).render(
    React.createElement(BookAppointment)
  );
}