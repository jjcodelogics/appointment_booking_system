// /public/js/components/LoginRegister.js
// LoginRegister.js
const React = window.React;
const { useState, useEffect, createElement } = window.React; 


export default function LoginRegister() {
  // Assuming window.api is still available globally for simplicity in the CDN structure.
  // In a proper module setup, you would import the api object.

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

  // NOTE: The rendering uses React.createElement for compatibility with main.cdn.js style
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