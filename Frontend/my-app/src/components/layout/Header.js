import { Link } from "react-router-dom";
import { useContext } from "react";
import { GlobalState } from "../../GlobalState"; // adjust path if needed
import "../styles/Header.css";

const Header = () => {
  const state = useContext(GlobalState);
  const [isAdmin] = state.isAdmin; // assuming you have isAdmin in GlobalState

  return (
    <header className="header">
      <div className="header-content">
        <img
          src="/Header.png" 
          alt="Integral University Logo"
          className="header-logo"
        />
        {/* Dynamic route based on admin */}
        <Link to={isAdmin ? "/Dashboard" : "/"} className="home-link">
          <h1 className="header-title">INTEGRAL UNIVERSITY</h1>
        </Link>
      </div>
    </header>
  );
};

export default Header;
