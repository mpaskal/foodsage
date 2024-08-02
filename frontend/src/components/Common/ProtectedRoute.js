// components/Common/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { loggedInUserState, sessionExpiredState } from "../../recoil/userAtoms";
import { useAuth } from "../../hooks/useAuth";

const ProtectedRoute = ({ requiredRole }) => {
  const { isAuthenticated, isInitialized } = useAuth();
  const user = useRecoilValue(loggedInUserState);
  const setSessionExpired = useSetRecoilState(sessionExpiredState);

  if (!isInitialized) {
    return <div>Initializing...</div>;
  }

  if (!isAuthenticated()) {
    setSessionExpired(true);
    return <Navigate to="/signin" replace />;
  }

  if (requiredRole && (!user || user.role !== requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
