import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GlobalState } from "../../GlobalState";
import "../styles/PickupPoints.css";

const PickupPoints = () => {
  const state = useContext(GlobalState);
  const [buses] = state.buses.buses;
  const [newBus, setNewBus] = useState([]);
  const [busId, setBusId] = useState("");
  const { id } = useParams();

  useEffect(() => {
    const bus = buses.find((bus) => bus._id === id);
    if (bus) {
      setBusId(bus.busId);
      setNewBus(bus.pickupPoints);
    }
  }, [buses, id]);

  return (
    <div className="pickup-container">
      <div className="pickup-list">
        {Object.keys(newBus).map((key, index) => (
          <div key={key} className="pickup-card">
            {/* ✅ Heading appears only above the first pickup point */}
            {index === 0 && (
              <h2 className="pickup-title-inside">
                Pickup Points of Bus {busId}
              </h2>
            )}

            <div className="pickup-item">
              <span className="pickup-number">{index + 1}</span>
              <h3 className="pickup-name">{newBus[key].name}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PickupPoints;