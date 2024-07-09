import React from "react";
import { Routes, Route } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { loggedInUserState } from "../recoil/userAtoms";
import HomePage from "../pages/SitePages/HomePage";
import AboutPage from "../pages/SitePages/AboutPage";
import ContactPage from "../pages/SitePages/ContactPage";
import SignInPage from "../pages/SitePages/SignInPage";
import SignUpPage from "../pages/SitePages/SignUpPage";
import DashboardPage from "../pages/AppPages/DashboardPage";
import UserManagementPage from "../pages/AppPages/UserManagementPage";
import FoodItemsPage from "../pages/AppPages/FoodItemsPage";
import WasteItemsPage from "../pages/AppPages/WasteItemsPage";
import WasteInsightsPage from "../pages/AppPages/WasteInsightsPage";
import ProtectedRoute from "./ProtectedRoute";
import useAxiosInterceptor from "../hooks/useAxiosInterceptor";

const AppContent = () => {
  const user = useRecoilValue(loggedInUserState);
  const role = user?.role;

  useAxiosInterceptor();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route element={<ProtectedRoute role={role} />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/fooditems" element={<FoodItemsPage />} />
        <Route path="/wasteitems" element={<WasteItemsPage />} />
        <Route
          path="/users"
          element={<UserManagementPage />}
          requiredRole="admin"
        />
        <Route
          path="/wasteinsights"
          element={<WasteInsightsPage />}
          requiredRole="admin"
        />
      </Route>
    </Routes>
  );
};

export default AppContent;
