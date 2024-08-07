// components/Common/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { loggedInUserState } from "../../recoil/userAtoms";
import { useAuth } from "../../hooks/useAuth";

const ProtectedRoute = ({ requiredRole }) => {
  const { isAuthenticated, isInitialized } = useAuth();
  const user = useRecoilValue(loggedInUserState);
  const location = useLocation();

  if (!isInitialized) {
    return <div>Initializing...</div>;
  }

  if (!isAuthenticated()) {
    // Don't set sessionExpired here, just redirect
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (requiredRole && (!user || user.role !== requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
