import React, { useContext, useState } from "react";
import axios from "axios";
import "../styles/CreateBus.css"
import { GlobalState } from "../../GlobalState";

const CreateBus = () => {
  const state = useContext(GlobalState);
  const [userToken] = state.userToken;

  const [formData, setFormData] = useState({
    busId: "",
    busNo: "",
    capacity: "",
    startLocation: { lat: "", lng: "" },
    endLocation: { lat: "", lng: "" },
    pickupPoints: [],
  });

  const [numPoints, setNumPoints] = useState(null);
  const [errVal, setErrVal] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [points, setPoints] = useState([]);
  const [savedPoints, setSavedPoints] = useState([]);

  // Handle number of pickup points
  const handlePoints = (e) => {
    const value = Number(e.target.value);
    setNumPoints(value);
    setPoints(Array(value).fill(""));
    setSavedPoints([]);
  };

  // Handle bus form input
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle pickup point input
  const handleInputChange = (e, index) => {
    const newPoints = [...points];
    newPoints[index] = e.target.value;
    setPoints(newPoints);
  };

  // Save each pickup point
  const handleInputSubmit = async (e, index) => {
    e.preventDefault();

    try {
      const location = points[index];
      if (!location) return;

      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          location
        )}`
      );

      if (!res.data || res.data.length === 0) {
        setErrVal("❌ Location not found");
        return;
      }

      const name = res.data[0].display_name || location;
      const lat = res.data[0].lat;
      const lon = res.data[0].lon;

      const newPoint = { name, lat, lng: lon };

      const updatedPickupPoints = [...formData.pickupPoints];
      updatedPickupPoints[index] = newPoint;

      setFormData((prev) => ({
        ...prev,
        pickupPoints: updatedPickupPoints,
      }));

      // First point = Start location
      if (index === 0) {
        setFormData((prev) => ({
          ...prev,
          startLocation: { lat: newPoint.lat, lng: newPoint.lng },
        }));
      }

      // Last point = End location
      if (numPoints === index + 1) {
        setFormData((prev) => ({
          ...prev,
          endLocation: { lat: newPoint.lat, lng: newPoint.lng },
        }));
      }

      const updatedSaved = [...savedPoints];
      updatedSaved[index] = newPoint;
      setSavedPoints(updatedSaved);

      setSuccessMsg(`✅ Pickup Point ${index + 1} saved!`);
      setErrVal("");
    } catch (err) {
      console.error(err);
      setErrVal("⚠️ Error fetching location");
    }
  };

  // Create bus API call
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/bus/create`,
        formData,
        {
          headers: {
            Authorization: userToken,
          },
        }
      );

      console.log(res.data);
      setSuccessMsg("🚍 Bus created successfully!");
      setErrVal("");
    } catch (err) {
      console.error(err);
      setErrVal("❌ Error creating bus");
    }
  };

  return (
    <div className="edit-bus-container">
      <h2 className="page-title">Create Bus</h2>

      {errVal && <div className="message error">{errVal}</div>}
      {successMsg && <div className="message success">{successMsg}</div>}

      <div className="form-layout">
        {/* ✅ Left Side - Bus Form */}
        <form onSubmit={handleSubmit} className="bus-form-section">
          <input
            type="number"
            name="busId"
            placeholder="Bus ID"
            value={formData.busId}
            onChange={handleChange}
            className="form-input"
            required
          />

          <input
            type="text"
            name="busNo"
            placeholder="Bus Number (e.g. UP32AB1234)"
            value={formData.busNo}
            onChange={handleChange}
            className="form-input"
            required
          />

          <input
            type="number"
            name="capacity"
            placeholder="Capacity"
            value={formData.capacity}
            onChange={handleChange}
            className="form-input"
          />

          <input
            type="number"
            name="points"
            placeholder="How many pickup points?"
            className="form-input"
            value={numPoints || ""}
            onChange={handlePoints}
          />

          <button type="submit" className="submit-button">
            Create Bus
          </button>
        </form>

        {/* ✅ Right Side - Pickup Points */}
        <div className="pickup-section">
          <h3 className="section-title">Pickup Points</h3>
          
          {points.map((point, index) => (
            <div key={index} className="pickup-input-group">
              <input
                type="text"
                placeholder={`Pickup point ${index + 1}`}
                value={point}
                onChange={(e) => handleInputChange(e, index)}
                className="form-input"
              />

              <button
                type="button"
                onClick={(e) => handleInputSubmit(e, index)}
                className="save-button small"
              >
                Save
              </button>
            </div>
          ))}

          {savedPoints.length > 0 && (
            <div className="saved-points-list">
              <h3 className="saved-title">✅ Saved Pickup Points</h3>
              <ul>
                {savedPoints.map(
                  (p, i) =>
                    p && (
                      <li key={i}>
                        <strong>{p.name}</strong> (Lat: {p.lat}, Lng: {p.lng})
                      </li>
                    )
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateBus;