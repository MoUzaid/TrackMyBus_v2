import React, { useContext, useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import Socket from "../../Socket";
import { GlobalState } from "../../GlobalState";

const RecenterMap = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView(coords, map.getZoom(), { animate: true, pan: { duration: 1 } });
  }, [coords, map]);
  return null;
};

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const hiddenIcon = L.divIcon({ className: "hidden-icon", iconSize: [0, 0] });

const MyMap = () => {
  const state = useContext(GlobalState);
  const [driver] = state.driver;
  const [Coordinates, setCoordinates] = useState([26.8481, 80.9177]);
  const [pickupMarkers, setPickupMarkers] = useState([]);
  const [route, setRoute] = useState([]);
  const [pickupETAs, setPickupETAs] = useState([]);
  const [currentEtaIndex, setCurrentEtaIndex] = useState(0);

  // 1️⃣ Fetch bus data and pickup markers
  useEffect(() => {
    const fetchBusData = async () => {
      if (!driver?.busId) return;
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/bus/${driver.busId}`);
        const { startLocation, endLocation, pickupPoints } = res.data;

        const allPickups = [
          { name: "Start", lat: startLocation.lat, lng: startLocation.lng },
          ...pickupPoints,
          { name: "End", lat: endLocation.lat, lng: endLocation.lng },
        ];
        setPickupMarkers(allPickups);
      } catch (err) {
        console.error("Error fetching bus data:", err);
      }
    };
    fetchBusData();
  }, [driver?.busId]);


  // 3️⃣ Send driver's location every 5 seconds
  useEffect(() => {
    if (!driver?.busId) return;

    const sendLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setCoordinates([lat, lng]); // update driver map

            Socket.emit("sendInfo", {
              name: driver.name || "Driver",
              busId: driver.busId,
              lat,
              lng,
            });
          },
          (err) => console.error("Geolocation error:", err)
        );
      } else {
        console.error("Geolocation not supported by this browser");
      }
    };

    sendLocation(); // initial send
    const intervalId = setInterval(sendLocation, 5000); // every 5 seconds

    return () => clearInterval(intervalId);
  }, [driver]);

  // 4️⃣ Update route polyline and ETAs
  const updateRouteAndETA = async () => {
    if (!pickupMarkers.length) return;
    try {
      const coordinates = [
        [Coordinates[1], Coordinates[0]], // driver current location
        ...pickupMarkers.map(p => [p.lng, p.lat]),
      ];

      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/ors/route`, { coordinates });
      if (res.data?.features?.length > 0) {
        const feature = res.data.features[0];
        const polylineCoords = feature.geometry.coordinates.map(c => [c[1], c[0]]);
        setRoute(polylineCoords);

        const segments = feature.properties.segments || [];
        const etas = [];
        let cumulativeSec = 0;
        let segmentIndex = 0;

        for (let i = 0; i < pickupMarkers.length; i++) {
          let duration = 0;
          if (segments[segmentIndex]) {
            duration = segments[segmentIndex].duration;
            segmentIndex++;
          }
          cumulativeSec += duration;
          const totalMinutes = Math.floor(cumulativeSec / 60);
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          etas.push({
            ...pickupMarkers[i],
            eta: `${hours > 0 ? hours + " hr " : ""}${minutes} min`,
          });
        }
        setPickupETAs(etas);
      }
    } catch (err) {
      console.error("Error updating route/ETA:", err);
      setPickupETAs(pickupMarkers.map(p => ({ ...p, eta: "N/A" })));
    }
  };

  useEffect(() => {
    updateRouteAndETA(); // initial call
    const intervalId = setInterval(updateRouteAndETA, 10000); // every 10s
    return () => clearInterval(intervalId);
  }, [Coordinates, pickupMarkers]);

  // 5️⃣ Rotate ETA tooltip
  useEffect(() => {
    if (!pickupETAs.length) return;
    const intervalId = setInterval(() => setCurrentEtaIndex(prev => (prev + 1) % pickupETAs.length), 7000);
    return () => clearInterval(intervalId);
  }, [pickupETAs.length]);

  const nextETA = pickupETAs.length > 0 ? pickupETAs[currentEtaIndex].eta : "N/A";

  return (
    <>
      <MapContainer center={Coordinates} zoom={13} style={{ height: "600px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <RecenterMap coords={Coordinates} />

        {/* Driver marker */}
        <CircleMarker
          center={Coordinates}
          radius={10}
          pathOptions={{ color: "red", fillColor: "orange", fillOpacity: 0.7 }}
        >
          <Popup>
            <div>
              <strong>Driver Location</strong>
              <br />
              Next ETA: {nextETA}
            </div>
          </Popup>
        </CircleMarker>

        {/* Pickup markers */}
        {pickupMarkers.map((p, i) => (
          <Marker key={i} position={[p.lat, p.lng]} icon={defaultIcon}>
            <Popup>
              <strong>{p.name}</strong>
              <br />
              ETA: {pickupETAs.find(e => e.name === p.name)?.eta || "Calculating..."}
            </Popup>
          </Marker>
        ))}

        {/* Rotating ETA Tooltip */}
        {pickupETAs.length > 0 && (
          <Marker
            position={[pickupETAs[currentEtaIndex].lat, pickupETAs[currentEtaIndex].lng]}
            icon={hiddenIcon}
          >
            <Tooltip permanent direction="top" offset={[0, -10]}>
              {pickupETAs[currentEtaIndex].name}: {pickupETAs[currentEtaIndex].eta}
            </Tooltip>
          </Marker>
        )}

        {/* Route Polyline */}
        {route.length > 0 && <Polyline positions={route} pathOptions={{ color: "blue", weight: 4 }} />}
      </MapContainer>

      {/* ETA List */}
      {pickupETAs.length > 0 && (
        <div style={{ marginTop: "10px", padding: "10px" }}>
          <h4>Live ETAs:</h4>
          <ul>
            {pickupETAs.map((p, i) => (
              <li key={i}>
                {p.name}: <strong>{p.eta}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default MyMap;
