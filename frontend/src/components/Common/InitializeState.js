import React from "react";
import { useAuth } from "../../hooks/useAuth";

const InitializeState = ({ children }) => {
  const { isInitialized } = useAuth();

  if (!isInitialized) {
    return <div>Initializing...</div>;
  }

  return children;
};

export default InitializeState;
