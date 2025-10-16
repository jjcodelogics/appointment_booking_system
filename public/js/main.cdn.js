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

  React.useEffect(() => {
    window.api.getMyAppointments()
      .then(data => {
        setAppointments(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load appointments');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return React.createElement("div", null, "Loading...");
  }
  if (error) {
    return React.createElement("div", { className: "error-message" }, error);
  }

  return React.createElement(
    "div",
    { className: "container" },
    React.createElement("h1", null, "My Appointments"),
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
              React.createElement("th", null, "Notes")
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
                React.createElement("td", null, appt.notes || "")
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