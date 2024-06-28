import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/SitePages/HomePage";
import AboutPage from "./pages/SitePages/AboutPage";
import ContactPage from "./pages/SitePages/ContactPage";
import SignInPage from "./pages/SitePages/SignInPage";
import SignUpPage from "./pages/SitePages/SignUpPage";
import DashboardPage from "./pages/AppPages/DashboardPage";
import UserManagementPage from "./pages/AppPages/UserManagementPage";
import FoodInventoryPage from "./pages/AppPages/FoodInventoryPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "bootstrap/dist/css/bootstrap.min.css";

import "./App.css";

function App() {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        <Route element={<ProtectedRoute role={role} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/inventory/all" element={<FoodInventoryPage />} />
          <Route
            path="/user-management"
            element={<UserManagementPage />}
            requiredRole="admin"
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
