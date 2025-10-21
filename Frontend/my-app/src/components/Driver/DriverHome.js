import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Socket from "../../Socket";
import "../styles/Home.css";
import { GlobalState } from "../../GlobalState";

const DriverHome = () => {
  const state = useContext(GlobalState);
  const [driverToken, setDriverToken] = state.driverToken;
  const [driver, setDriver] = state.driver;
  const navigate = useNavigate();

  const handleClick = () => {
    if (driver.busId) {
      Socket.emit("join_room", driver.busId);
    }
    navigate("/map");
  };

  return (
    <div>
      <div className="home-layout">
        {/* Left Section */}
        <div className="left-section">
          <h1 className="hero-title">Share Your Location</h1>
          <button className="hero-btn" onClick={handleClick}>
            📍 Start Sharing
          </button>
        </div>

        {/* Right Section */}
        <div className="right-section">
          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar">👤</div>
              {/* <h2 className="username">{driver.name}</h2> */}
              <p className="role">Driver</p>
            </div>

            <div className="profile-body">
              <p>
                <strong>Name:</strong> {driver.name}
              </p>
              <p>
                <strong>Email:</strong> {driver.email}
              </p>
              <p>
                <strong>Bus:</strong> {driver.busId}
              </p>
              <p>
                <strong>Bus No:</strong> {driver.busNo}
              </p>
              <p>
                <strong>Contact:</strong> {driver.phoneNumber}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverHome;
