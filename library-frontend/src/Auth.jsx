import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Auth.css";

const API_URL = "http://localhost:5000";

const AuthPage = () => {
  const [form, setForm] = useState("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    userType: "user",
  });
  const [error, setError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password || (form === "signup" && !formData.name)) {
      toast.error("All fields are required", { position: "top-center" });
      setError("All fields are required");
      return;
    }

    if (form === "signup" && !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(formData.password)) {
      setError("Password must be at least 6 characters long and include a number.");
      return;
    }

    const endpoint = `${API_URL}/api/auth/${form}`;
    const body = form === "login" ? { email: formData.email, password: formData.password } : { ...formData };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });

      const data = await response.json();

      if (form === "signup") {
        if (data.message === "User already exists ❌") {
          setError("This email is already registered. Please try another one.");
          setSignupSuccess("");
        } else {
          setSignupSuccess("Signup successful! You can now login.");
          setError("");

          toast.success("User registered successfully! You can now login.", {
            position: "top-center",
            autoClose: 3000,
            closeButton: false, // Remove close button
          });

          setFormData({ name: "", email: "", password: "", userType: "user" });
          setForm("login");
        }
      } else if (form === "login") {
        if (response.ok) {
          setError("");
          localStorage.setItem("isAdmin", data.role === "admin" ? "true" : "false");
          localStorage.setItem("token", data.token);

          if (data.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/borrowed-books");
          }
        } else {
          setError("Invalid email or password. Please try again.");
          setSignupSuccess("");
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const switchForm = () => {
    setFormData({ name: "", email: "", password: "", userType: "user" });
    setError("");
    setSignupSuccess("");
    setForm(form === "login" ? "signup" : "login");
  };

  return (
    <div className="auth-wrapper">
    <div className="auth-container">
        <div className="auth-box">
          <h1 className="library-title">Library Management System</h1>
          <h2>{form === "login" ? "Login" : "Signup"}</h2>
          <form onSubmit={handleSubmit} className="auth-form">
            {form === "signup" && (
              <>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <select name="userType" value={formData.userType} onChange={handleChange}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </>
        )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button type="submit" className="auth-button">
              {form === "login" ? "Login" : "Signup"}
      </button>
          </form>

          {error && <div className="error-message">{error}</div>}
          {form === "signup" && signupSuccess && <div className="success-message">{signupSuccess}</div>}

          <p className="switch-text" onClick={switchForm}>
            {form === "login" ? "Create an account" : "Already have an account? Login"}
          </p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AuthPage;
