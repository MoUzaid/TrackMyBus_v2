import React, { useContext, useEffect, useState } from "react";
import { GlobalState } from "../../GlobalState";
import { Link , useNavigate} from "react-router-dom";
import Socket from "../../Socket";
import axios from "axios";
import {
  FaBus,
  FaUser,
  FaUsers,
  FaTrash,
  FaPlus,
  FaMapMarkedAlt,
} from "react-icons/fa";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const state = useContext(GlobalState);
  const [buses] = state.buses.buses;
  const [userToken] = state.userToken;
  const [drivers, setDrivers] = useState([]);
  const [isAdmin] = state.isAdmin;
  const Navigate=useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAdmin();
    }, 5000);

    return () => clearTimeout(timer); 
  }, []);

  const checkAdmin = () => {
    if(!isAdmin) {
  alert("Admin Access Denied");
  Navigate('/');
}
  };

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/driver/all-drivers`, {
          headers: { Authorization: userToken },
        });
        setDrivers(res.data);
      } catch (err) {
        console.error("Error fetching drivers:", err);
      }
    };
    fetchDrivers();
  }, [userToken]);

  // ✅ Delete a bus
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this bus?")) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/bus/delete/${id}`, {
          headers: { Authorization: userToken },
        });
        alert("✅ Bus deleted successfully");
        window.location.reload();
      } catch (err) {
        console.error("Error deleting bus:", err);
        alert("❌ Failed to delete bus");
      }
    }
  };

  // ✅ Track a bus (future socket or navigation event)
  const joinRoom = (busId) => {
    if (!busId) {
      alert("⚠️ Bus ID is required to track the bus.");
      return;
    }
    Socket.emit("join_room", busId);
    Navigate(`/admin_map/${busId}`);
    console.log("Tracking Bus:", busId);
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Admin Dashboard</h1>

      {/* ✅ Action Buttons */}
      <div className="dashboard-actions">
        <Link to="/driver-register" className="action-btn green">
          <FaUser className="action-icon" /> Register Driver
        </Link>
        <Link to="/create-bus" className="action-btn blue">
          <FaPlus className="action-icon" /> Create Bus
        </Link>
      </div>

      {/* ✅ Summary Section */}
      <div className="summary-cards">
        <div className="summary-card blue">
          <FaBus className="summary-icon" />
          <div>
            <p className="summary-label">Total Buses</p>
            <h2 className="summary-value">{buses.length}</h2>
          </div>
        </div>

        <div className="summary-card green">
          <FaUsers className="summary-icon" />
          <div>
            <p className="summary-label">Total Drivers</p>
            <h2 className="summary-value">{drivers.length}</h2>
          </div>
        </div>
      </div>

      {/* ✅ Buses Section */}
      <div className="bus-grid">
        {buses.map((bus) => (
          <div key={bus._id} className="bus-card">
            <div className="bus-header">
              <FaBus className="bus-icon" />
              <h3 className="bus-title">Bus {bus.busNo}</h3>
            </div>

            <p>
              <strong>ID:</strong> {bus.busId}
            </p>
            <p>
              <strong>Capacity:</strong> {bus.capacity}
            </p>

            <div className="bus-links">
              <Link to={`/edit-bus/${bus.busId}`} className="btn blue">
                Edit Bus
              </Link>

              <Link to={`/pickup_points/${bus._id}`} className="btn green">
                Pickup Points
              </Link>

              <Link to={`/view-students/${bus.busId}`} className="btn purple">
                Students
              </Link>

              <button
                className="btn gradient"
                onClick={() => joinRoom(bus.busId)}
              >
                <FaMapMarkedAlt /> Track Bus
              </button>

              <button
                className="btn red"
                onClick={() => handleDelete(bus._id)}
              >
                <FaTrash className="delete-icon" /> Delete
              </button>
            </div>

            {/* ✅ Driver Info */}
            {drivers
              .filter((driver) => driver.busId === bus.busId)
              .map((driver) => (
                <div key={driver._id} className="driver-card">
                  <div className="driver-header">
                    <FaUser className="driver-icon" />
                    <h4>{driver.name}</h4>
                  </div>
                  <p>
                    <strong>Email:</strong> {driver.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {driver.phoneNumber}
                  </p>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;


