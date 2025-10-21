import React, { useContext, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { GlobalState } from "../../GlobalState";
import { getToken } from "firebase/messaging";
import { messaging } from "../../firebase";
import "../styles/Auth.css";

const LoginUser = () => {
  const state = useContext(GlobalState);
  const [isUserLogin, setIsUserLogin] = state.isUserLogin;
  const [user, setUser] = state.user;
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  // handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    try {
     const res = await axios.post(
  `${process.env.REACT_APP_API_URL}/user/login`,
  formData,
  { withCredentials: true }
);


      setMessage({ text: "Login successful! Redirecting...", type: "success" });

      setTimeout(async () => {
        const loggedUser = res.data.user;

        // Store login info locally
        localStorage.setItem("firstLogin", "true");
        localStorage.setItem("user", JSON.stringify(loggedUser));

        // Update global state
        setIsUserLogin(true);
        setUser(loggedUser);
       if(loggedUser.role === 1){
         navigate("/Dashboard");
       }else{
        navigate("/");
       }

        // ✅ Generate/check FCM token after login
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const token = await getToken(messaging, {
            vapidKey: process.env.REACT_APP_VAPID_KEY,
          });
          if (token && loggedUser._id) {
            await axios.post(`${process.env.REACT_APP_API_URL}/user/save-fcm-token`, {
              userId: loggedUser._id,
              token,
            });
          }
        }
      }, 1000);
    } catch (err) {
      setMessage({
        text:
          err.response?.data?.msg ||
          "Login failed. Please check your credentials.",
        type: "error",
      });
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-card">
        <h2 className="auth-title">Student Login</h2>

        <div className="auth-form">
          <input
            className="auth-input"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            className="auth-input"
            type="password"
            name="password"
            placeholder="Enter your password"
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
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">
            Register
          </Link>
        </p>
         <p className="auth-text">
        <Link to="/forgot-password" className="auth-link">
            Forgot Password
          </Link>
          </p>
      </form>
    </div>
  );
};

export default LoginUser;
