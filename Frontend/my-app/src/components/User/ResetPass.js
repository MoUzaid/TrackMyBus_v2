import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/ResetPass.css";

const ResetPass = () => {
  const { token } = useParams(); // Token from URL
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) return setMessage("Please fill all fields");
    if (password !== confirmPassword) return setMessage("Passwords do not match");

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/user/reset-password`,
        { password, confirmPassword, token },
        { withCredentials: true }
      );
      setMessage(res.data.msg || "Password reset successfully!");
      setPassword("");
      setConfirmPassword("");
      // Optional: redirect to login after success
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.msg || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-pass-container">
      <h2>Reset Password</h2>
      <form onSubmit={handleReset} className="reset-pass-form">
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default ResetPass;
