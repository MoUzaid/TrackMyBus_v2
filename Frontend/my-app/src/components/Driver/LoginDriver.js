import React, { useState, useContext } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import { GlobalState } from "../../GlobalState";

const LoginDriver = () => {
  const state = useContext(GlobalState);
  const [isDriverLogin, setIsDriverLogin] = state.isDriverLogin;
  const [driver, setDriver] = state.driver;
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/driver/login`,
        formData,
        { withCredentials: true }
      );

      setMessage({ text: "Login successful! Redirecting...", type: "success" });

      setTimeout(() => {
        localStorage.setItem("driverFirstLogin", "true");
        localStorage.setItem("driver", JSON.stringify(res.data.driver));

        setIsDriverLogin(true);
        setDriver(res.data.driver);

        navigate("/driver-home");
      }, 1000);
    } catch (err) {
      setMessage({
        text:
          err.response?.data?.msg ||
          "Login failed. Please check credentials.",
        type: "error",
      });
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-card">
        <h2 className="auth-title">Driver Login</h2>

        <div className="auth-form">
          <input
            className="auth-input"
            id="email"
            type="email"
            placeholder="you@example.com"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            className="auth-input"
            id="password"
            type="password"
            placeholder="Enter your password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="auth-btn">
            Login
          </button>
        </div>

        {message.text && (
          <p
            className={`auth-error ${
              message.type === "success" ? "success" : "error"
            }`}
          >
            {message.text}
          </p>
        )}

        <p className="auth-text">
          <Link to="/forgot-password-driver" className="auth-link">
            Forgot Your Password
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginDriver;
