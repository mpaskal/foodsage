import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { loggedInUserState } from "../../recoil/userAtoms";
import { useAuth } from "../../hooks/useAuth";

const ProtectedRoute = ({ requiredRole }) => {
  const { isAuthenticated, isInitialized } = useAuth();
  const user = useRecoilValue(loggedInUserState);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/signin" replace />;
  }

  if (requiredRole && (!user || user.role !== requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
