import React, { useState } from "react";
import axios from "axios";
import "../styles/ForgotPass.css";

const ForgotPass = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Reset previous message

    if (!email) {
      setMessage("Please enter your email");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/user/forgot-password`,
        { email },
      );
      console.log(res);
      // ✅ Success
      setMessage(res.data.msg || "Email sent successfully!");
      setEmail(""); // clear input
    } catch (err) {
      // ✅ Error handling
      setMessage(err.response?.data?.msg || "Something went wrong!");
    } finally {
      setLoading(false); // ✅ Make sure to stop loading
    }
  };

  return (
    <div className="forgot-pass-container">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit} className="forgot-pass-form">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Email"}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default ForgotPass;
