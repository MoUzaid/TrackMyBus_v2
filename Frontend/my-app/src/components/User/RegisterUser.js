import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { GlobalState } from "../../GlobalState";
import "../styles/Register.css"; 
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { firebaseApp } from "../../firebase"; 

const messaging = getMessaging(firebaseApp);

const RegisterUser = () => {
  const state = useContext(GlobalState);
  const [buses] = state.buses.buses;
  const [isUserLogin, setIsUserLogin] = state.isUserLogin;
  const [user, setUser] = state.user;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "", email: "", busId: "", enroll: "",
    pickupLocation: "", course: "", year: "", password: ""
  });
  const [pickupLocations, setPickupLocations] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/user/register`,
        formData,
        { withCredentials: true }
      );

      setMessage({ text: "Registration successful! Redirecting...", type: "success" });

      setTimeout(async () => {
        const newUser = res.data.user || formData;

        localStorage.setItem("firstLogin", "true");
        localStorage.setItem("user", JSON.stringify(newUser));
        setIsUserLogin(true);
        setUser(newUser);
        navigate("/");

        // ✅ Generate FCM token after registration
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const token = await getToken(messaging, { vapidKey: process.env.REACT_APP_MY_VAPID_KEY });
          if (token && newUser._id) {
            await axios.post(`${process.env.REACT_APP_API_URL}/user/save-fcm-token`, {
              userId: newUser._id,
              token,
            });
          }
        }
      }, 1500);

    } catch (err) {
      setMessage({
        text: err.response?.data?.msg || "Something went wrong",
        type: "error",
      });
    }
  };

  useEffect(() => {
    // Fetch pickup locations when busId changes
    const getPickupLocation = async () => {
      if(!formData.busId) return;
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/bus/${formData.busId}`);
        setPickupLocations(res.data.pickupPoints);
      } catch (err) {
        console.log(err);
      }
    }
    getPickupLocation();

    // ✅ Foreground notification listener
    const unsubscribe = onMessage(messaging, (payload) => {
      alert(`${payload.notification.title} - ${payload.notification.body}`);
    });
    return () => unsubscribe();
  }, [formData.busId]);

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2>Create Student Account</h2>

        <input placeholder="Full Name" name="name" value={formData.name} onChange={handleChange} required />
        <input placeholder="Email" name="email" value={formData.email} onChange={handleChange} required />

        <select name="busId" value={formData.busId} onChange={handleChange} required>
          <option value="">Select Bus</option>
          {buses.map(bus => <option key={bus._id} value={bus.busId}>{bus.busId}</option>)}
        </select>

        <select name="pickupLocation" value={formData.pickupLocation} onChange={handleChange} required>
          <option value="">Select Pickup Location</option>
          {pickupLocations.map(loc => <option key={loc._id} value={loc.name}>{loc.name}</option>)}
        </select>

        <input placeholder="Enrollment No." name="enroll" value={formData.enroll} onChange={handleChange} required />
        <input placeholder="Course" name="course" value={formData.course} onChange={handleChange} required />
        <input placeholder="Year" type="number" name="year" value={formData.year} onChange={handleChange} required />
        <input placeholder="Password" type="password" name="password" value={formData.password} onChange={handleChange} required />

        <button type="submit">Register</button>
        {message.text && <p className={message.type}>{message.text}</p>}

        <p>Already have an account? <Link to="/login">Sign In</Link></p>
      </form>
    </div>
  );
};

export default RegisterUser;
