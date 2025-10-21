import { useEffect, useState } from 'react';
import axios from 'axios';

// BusAPI is a small custom hook-style function returning buses state
const BusAPI = () => {
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    const getAllBuses = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/bus/buses`);
        console.log(res.data);
        setBuses(res.data || []);
      } catch (err) {
        console.error('Failed to fetch buses:', err.message || err);
      }
    };

    getAllBuses();
  }, []);

  return { buses: [buses, setBuses] };
};

export default BusAPI;