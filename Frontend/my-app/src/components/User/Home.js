import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Socket from "../../Socket";
import "../styles/Home.css";
import { GlobalState } from "../../GlobalState";

const Home = () => {
  const state = useContext(GlobalState);
  const [userToken, setUserToken] = state.userToken;
  const [user, setUser] = state.user;
  const navigate = useNavigate();

  const handleClick = () => {
    if (user.busId) {
      Socket.emit("join_room", user.busId);
    }
    navigate("/user-map");
  };

  return (
    <div>
      <div className="home-layout">
        {/* Left Section */}
        <div className="left-section">
          <h1 className="hero-title">Track Your Bus</h1>
          <button className="hero-btn" onClick={handleClick}>
            🚍 Start Tracking
          </button>
        </div>

        {/* Right Section */}
        <div className="right-section">
          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar">👤</div>
              {/* <h2 className="username">{user.name}</h2> */}
              <p className="role">Student</p>
            </div>

            <div className="profile-body">
              <p>
                <strong>Name:</strong> {user.name}
              </p>
              <p>
                <strong>Bus:</strong> {user.busId}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Course:</strong> {user.course}
              </p>
              <p>
                <strong>Year:</strong> {user.year}
              </p>
              <p>
                <strong>Enroll:</strong> {user.enroll}
              </p>
              <p>
                <strong>Pickup Location:</strong> {user.pickupLocation} 
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
