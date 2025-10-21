import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import "../styles/CreateBus.css"; // Updated CSS file name
import { GlobalState } from "../../GlobalState";
import { useParams } from "react-router-dom";

const EditBus = () => {
  const params = useParams();
  const busId = params.busId;
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

  const [points, setPoints] = useState([]);
  const [savedPoints, setSavedPoints] = useState([]);
  const [errVal, setErrVal] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ✅ Fetch bus details when component loads
  useEffect(() => {
    const fetchBus = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/bus/${busId}`, {
          headers: { Authorization: userToken },
        });

        const bus = res.data;
        setFormData({
          busId: bus.busId,
          busNo: bus.busNo,
          capacity: bus.capacity,
          startLocation: bus.startLocation || { lat: "", lng: "" },
          endLocation: bus.endLocation || { lat: "", lng: "" },
          pickupPoints: bus.pickupPoints || [],
        });

        setPoints(bus.pickupPoints.map((p) => p.name || ""));
        setSavedPoints(bus.pickupPoints);
      } catch (err) {
        console.error("Error fetching bus:", err);
        setErrVal("❌ Unable to fetch bus details");
      }
    };
    fetchBus();
  }, [busId, userToken]);

  // ✅ Handle input change
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ✅ Handle pickup point text changes
  const handleInputChange = (e, index) => {
    const newPoints = [...points];
    newPoints[index] = e.target.value;
    setPoints(newPoints);
  };

  // ✅ Save individual pickup point
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

      // Update start/end
      if (index === 0) {
        setFormData((prev) => ({
          ...prev,
          startLocation: { lat: newPoint.lat, lng: newPoint.lng },
        }));
      }
      if (index === formData.pickupPoints.length - 1) {
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

  // ✅ Submit edited bus data
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/bus/update/${busId}`, formData, {
        headers: { Authorization: userToken },
      });

      setSuccessMsg("✅ Bus updated successfully!");
      setErrVal("");
    } catch (err) {
      console.error(err);
      setErrVal("❌ Error updating bus");
    }
  };

  return (
    <div className="edit-bus-container">
      <h2 className="page-title">Edit Bus</h2>

      {errVal && <div className="message error">{errVal}</div>}
      {successMsg && <div className="message success">{successMsg}</div>}

      <div className="form-layout">
        {/* ✅ Left Side - Edit Form */}
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

          <button type="submit" className="submit-button">
            Update Bus
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
              <h3 className="saved-title">Saved Pickup Points</h3>
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

export default EditBus;