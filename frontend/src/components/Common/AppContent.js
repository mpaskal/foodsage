import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { toast } from "react-toastify";
import { loggedInUserState, sessionExpiredState } from "../../recoil/userAtoms";
import { useSessionManager } from "../../hooks/useSessionManager";
import { useAuth } from "../../hooks/useAuth";

// Import all your pages
import HomePage from "../../pages/SitePages/HomePage";
import AboutPage from "../../pages/SitePages/AboutPage";
import ContactPage from "../../pages/SitePages/ContactPage";
import SignInPage from "../../pages/SitePages/SignInPage";
import SignUpPage from "../../pages/SitePages/SignUpPage";
import DashboardPage from "../../pages/AppPages/DashboardPage";
import UserManagementPage from "../../pages/AppPages/UserManagementPage";
import FoodItemsPage from "../../pages/AppPages/FoodItemsPage";
import FoodInsightsPage from "../../pages/AppPages/FoodInsightsPage";
import DonationItemsPage from "../../pages/AppPages/DonationItemsPage";
import DonationInsightsPage from "../../pages/AppPages/DonationInsightsPage";
import WasteItemsPage from "../../pages/AppPages/WasteItemsPage";
import WasteInsightsPage from "../../pages/AppPages/WasteInsightsPage";
import SavingTrackingPage from "../../pages/AppPages/SavingTrackingPage";
import ProtectedRoute from "./ProtectedRoute";

const AppContent = () => {
  const user = useRecoilValue(loggedInUserState);
  const role = user?.role;
  const sessionExpired = useRecoilValue(sessionExpiredState);
  const setSessionExpired = useSetRecoilState(sessionExpiredState);
  const navigate = useNavigate();
  const { logout } = useSessionManager();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (sessionExpired) {
      // toast.error("Your session has ended. Please sign in again.");
      handleLogout();
    }
  }, [sessionExpired]);

  const handleLogout = () => {
    logout();
    setSessionExpired(false);
    navigate("/signin");
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route element={<ProtectedRoute role={role} />}>
          <Route
            path="/users"
            element={<UserManagementPage />}
            requiredRole="admin"
          />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/fooditems" element={<FoodItemsPage />} />
          <Route path="/foodinsights" element={<FoodInsightsPage />} />
          <Route path="/wasteitems" element={<WasteItemsPage />} />
          <Route path="/donationitems" element={<DonationItemsPage />} />
          <Route path="/donationinsights" element={<DonationInsightsPage />} />
          <Route path="/wasteinsights" element={<WasteInsightsPage />} />
          <Route path="/savings" element={<SavingTrackingPage />} />
        </Route>
      </Routes>
    </>
  );
};

export default AppContent;
