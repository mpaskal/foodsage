import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/BeforeLoginPages/HomePage";
import AboutPage from "./pages/BeforeLoginPages/AboutPage";
import ContactPage from "./pages/BeforeLoginPages/ContactPage";
import SignInPage from "./pages/BeforeLoginPages/SignInPage";
import SignUpPage from "./pages/BeforeLoginPages/SignUpPage";
import DashboardPage from "./pages/UserPages/DashboardPage";
import TenantManagementPage from "./pages/AdminPages/TenantManagementPage";
import UserManagementPage from "./pages/AdminPages/UserManagementPage";

import "./App.css"; // Import the global stylesheet

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Admin routes */}
        <Route
          path="/admin/tenant-management"
          element={<TenantManagementPage />}
        />
        <Route path="/admin/user-management" element={<UserManagementPage />} />
      </Routes>
    </Router>
  );
}

export default App;
