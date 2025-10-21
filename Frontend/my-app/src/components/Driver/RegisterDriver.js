import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Register.css";
import { GlobalState } from "../../GlobalState";

const RegisterDriver = () => {
  const state = useContext(GlobalState);
  const [buses] = state.buses.buses;
  const [isDriverLogin, setIsDriverLogin] = state.isDriverLogin;
  const [driver, setDriver] = state.driver;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    busId: "",
    busNo: "",
    phoneNumber: "",
    password: "",
  });

  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    try {
      const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/driver/register`,
        formData,
        { withCredentials: true }
      );

      setMessage({ text: "Registration successful! Redirecting...", type: "success" });

      setTimeout(() => {
        localStorage.setItem("driverFirstLogin", "true");
        localStorage.setItem("driver", JSON.stringify(res.data.driver || formData));
        
        setIsDriverLogin(true);
        setDriver(res.data.driver || formData);
        navigate("/driver");
      }, 1500);

    } catch (err) {
      setMessage({
        text: err.response?.data?.msg || "Error registering driver.",
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (!formData.busId) {
      setFormData(prev => ({ ...prev, busNo: '' }));
      return;
    }

    const fetchBusDetails = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/bus/${formData.busId}`);
        setFormData((prev) => ({ ...prev, busNo: res.data.busNo }));
      } catch (error) {
        console.error("Failed to fetch bus number", error);
      }
    };

    fetchBusDetails();
  }, [formData.busId]);

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-header">
          <h2 className="form-title">Driver Registration</h2>
          <p className="form-subtitle">Create a driver account to get started</p>
        </div>

        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name" type="text" name="name"
            placeholder="e.g., John Doe"
            value={formData.name} onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email" type="email" name="email"
            placeholder="you@example.com"
            value={formData.email} onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="busId">Bus ID</label>
          <select
            id="busId" name="busId"
            value={formData.busId} onChange={handleChange}
            required
          >
            <option value="" disabled>Select a Bus ID</option>
            {buses.map((bus) => (
              <option key={bus._id} value={bus.busId}>
                {bus.busId}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="busNo">Bus Number</label>
          <input
            id="busNo" type="text" name="busNo"
            placeholder="Will be filled automatically"
            value={formData.busNo}
            readOnly disabled
          />
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            id="phoneNumber" type="tel" name="phoneNumber"
            placeholder="10-digit mobile number"
            value={formData.phoneNumber} maxLength="10"
            pattern="\d{10}" onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password" type="password" name="password"
            placeholder="Enter a secure password"
            value={formData.password} onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="submit-btn">Register</button>

        {message.text && (
          <p className={`auth-message ${message.type}`}>{message.text}</p>
        )}

        <p className="auth-text">
          Already have an account?{" "}
          <Link to="/driver-login" className="auth-link">Sign In</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterDriver;