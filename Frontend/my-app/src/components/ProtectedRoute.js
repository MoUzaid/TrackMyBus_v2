import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export const AdminRoute = () => {
  const storedUser = localStorage.getItem("user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const isUserLogin = localStorage.getItem("firstLogin") === "true";
  const isAdminLocally = parsedUser && parsedUser.role === 1;

  return isUserLogin && isAdminLocally ? <Outlet /> : <Navigate to="/login" replace />;
};

export const UserRoute = () => {
  const isUserLogin = localStorage.getItem("firstLogin") === "true";
  return isUserLogin ? <Outlet /> : <Navigate to="/login" replace />;
};

export const DriverRoute = () => {
  const isDriverLogin = localStorage.getItem("driverFirstLogin") === "true";
  return isDriverLogin ? <Outlet /> : <Navigate to="/driver-login" replace />;
};
