import { createContext, useEffect, useState } from "react";
import axios from "axios";
import BusAPI from "./components/APIs/BusAPI";

export const GlobalState = createContext();

export const DataProvider = ({ children }) => {
  // ----- User States -----
 const [userToken,setUserToken] = useState("");
  const [isUserLogin, setIsUserLogin] = useState(false);
  const [user, setUser] = useState({
    name: "",
    email: "",
    busId: "",
    enroll: "",
    pickupLocation: "",
    course: "",
    year: "",
    role: 0,
  });
  const [isAdmin,setIsAdmin]=useState(false);

  // ----- Driver States -----
const [driverToken,setDriverToken]=useState("");
  const [isDriverLogin, setIsDriverLogin] = useState(false);
  const [driver, setDriver] = useState({});

  // ----- Refresh Tokens -----
  const refreshUserToken = async () => {
    try {
      console.log(isUserLogin);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/user/refresh_token`, {
        withCredentials: true,
      });
      console.log(res.data.accessToken);
      setUserToken(res.data.accessToken);
    } catch (err) {
      console.error("Failed to refresh user token:", err.response?.data?.msg || err.message);
    }
  };

  const refreshDriverToken = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/driver/refresh_token`, {
        withCredentials: true,
      });
      setDriverToken(res.data.accessToken);
    } catch (err) {
      console.error("Failed to refresh driver token:", err.response?.data?.msg || err.message);
    }
  };

  useEffect(() => {
    const firstLogin = localStorage.getItem("firstLogin");
    const driverLogin = localStorage.getItem("driverFirstLogin");

    if (firstLogin === "true") setIsUserLogin(true);
    if (driverLogin === "true") setIsDriverLogin(true);

    const storedUser = localStorage.getItem("user");
    const storedDriver = localStorage.getItem("driver");

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedDriver) setDriver(JSON.parse(storedDriver));
  }, []);

   useEffect(() => {
    if (user && user.role === 1) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);


  useEffect(() => {
    if (isUserLogin) refreshUserToken();
  }, [isUserLogin]);

  useEffect(() => {
    if (isDriverLogin) refreshDriverToken();
  }, [isDriverLogin]);


  useEffect(() => {
    const fetchUser = async () => {
      if (!userToken) return;
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/user/info`, {
          headers: { Authorization: userToken },
        });
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch (err) {
        console.error("Failed to fetch user info:", err.response?.data?.msg || err.message);
      }
    };
    fetchUser();
  }, [userToken]);

  // ----- Fetch Driver Info -----
  useEffect(() => {
    const fetchDriver = async () => {
      if (!driverToken) return;
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/driver/info`, {
          headers: { Authorization: driverToken },
        });
        setDriver(res.data);
        localStorage.setItem("driver", JSON.stringify(res.data));
      } catch (err) {
        console.error("Failed to fetch driver info:", err.response?.data?.msg || err.message);
      }
    };
    fetchDriver();
  }, [driverToken]);

  // ----- Global State -----
  const state = {
    userToken: [userToken, setUserToken],
    driverToken:[driverToken,setDriverToken],
    user: [user, setUser],
    driver: [driver, setDriver],
    buses: BusAPI(),
    isUserLogin: [isUserLogin, setIsUserLogin],
    isDriverLogin: [isDriverLogin, setIsDriverLogin],
    isAdmin: [isAdmin, setIsAdmin],
  };

  return <GlobalState.Provider value={state}>{children}</GlobalState.Provider>;
};
