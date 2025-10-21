import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { GlobalState } from "../../GlobalState";
import "../styles/Navbar.css";

const Navbar = () => {
  const state = useContext(GlobalState);
  const [isUserLogin, setIsUserLogin] = state.isUserLogin;
  const [isAdmin, setIsAdmin] = state.isAdmin;
  const [user, setUser] = state.user;
  const [driver, setDriver] = state.driver;
  const [isDriverLogin, setIsDriverLogin] = state.isDriverLogin;
  const navigate = useNavigate();

  // ✅ Set roles correctly based on user object or localStorage
  useEffect(() => {
    const firstLogin = localStorage.getItem("firstLogin");
    const driverLogin = localStorage.getItem("driverFirstLogin");

    // User/Admin
    if ((user && user.email) || firstLogin === "true") {
      setIsUserLogin(true);
      if (user && user.role === 1) setIsAdmin(true);
      else setIsAdmin(false);
    } else {
      setIsUserLogin(false);
      setIsAdmin(false);
    }

    // Driver
    if ((driver && driver.name) || driverLogin === "true") {
      setIsDriverLogin(true);
    } else {
      setIsDriverLogin(false);
    }
  }, [user, driver]);

  // ✅ Logout handlers
  const handleUserLogout = async () => {
    try {
      await axios.get(`${process.env.REACT_APP_API_URL}/user/logout`, { withCredentials: true });
      setIsUserLogin(false);
      setIsAdmin(false);
      setUser({});
      localStorage.removeItem("firstLogin");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err) {
      console.log(err.response?.data?.msg);
    }
  };

  const handleDriverLogout = async () => {
    try {
      await axios.get(`${process.env.REACT_APP_API_URL}/driver/logout`, { withCredentials: true });
      setIsDriverLogin(false);
      setDriver({});
      localStorage.removeItem("driverFirstLogin");
      localStorage.removeItem("driver");
      navigate("/driver-login");
    } catch (err) {
      console.log(err.response?.data?.msg);
    }
  };

  return (
    <nav className="navbar">
      <div className="logo">TrackMyBus</div>
      <ul className="nav-links">
        {/* No one logged in */}
        {!isUserLogin && !isAdmin && !isDriverLogin && (
          <>
            <li>
              <Link to="/driver-login" className="nav-link login-btn">
                Driver Login
              </Link>
            </li>
            <li>
              <Link to="/login" className="nav-link login-btn">
                User Login
              </Link>
            </li>
          </>
        )}

        {/* Admin */}
        {isAdmin && (
          <li className="nav-item">
            <span className="nav-link welcome">Welcome, Admin {user?.name || ""}</span>
            <button onClick={handleUserLogout} className="btn-link">
              Logout
            </button>
          </li>
        )}

        {/* User */}
        {isUserLogin && !isAdmin && !isDriverLogin && (
          <li className="nav-item">
            <span className="nav-link welcome">Welcome, {user.name || "User"}</span>
            <button onClick={handleUserLogout} className="btn-link">
              Logout
            </button>
          </li>
        )}

        {/* Driver */}
        {isDriverLogin && !isUserLogin && !isAdmin && (
          <li className="nav-item">
            <span className="nav-link welcome">Welcome, Driver {driver.name || ""}</span>
            <button onClick={handleDriverLogout} className="btn-link">
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
