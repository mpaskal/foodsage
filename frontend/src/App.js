// File: frontend/src/App.js

import React, { Suspense } from "react";
import { Spinner } from "react-bootstrap";
import InitializeState from "./components/InitializeState";
import AppContent from "./components/Common/AppContent";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  return (
    <Suspense fallback={<Spinner animation="border" />}>
      <InitializeState>
        <AppContent />
        <ToastContainer position="top-center" autoClose={5000} />
      </InitializeState>
    </Suspense>
  );
}

export default App;
