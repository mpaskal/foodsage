import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RecoilRoot, useSetRecoilState } from "recoil";
import HomePage from "./pages/SitePages/HomePage";
import AboutPage from "./pages/SitePages/AboutPage";
import ContactPage from "./pages/SitePages/ContactPage";
import SignInPage from "./pages/SitePages/SignInPage";
import SignUpPage from "./pages/SitePages/SignUpPage";
import DashboardPage from "./pages/AppPages/DashboardPage";
import UserManagementPage from "./pages/AppPages/UserManagementPage";
import FoodItemsPage from "./pages/AppPages/FoodItemsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { loggedInUserState } from "./recoil/userAtoms";
import "./axiosConfig";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const InitializeState = ({ children }) => {
  const setLoggedInUser = useSetRecoilState(loggedInUserState);

  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
      console.log("User retrieved from local storage:", user); // Debug log
      setLoggedInUser(user);
    }
  }, [setLoggedInUser]);

  return children;
};

function App() {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  return (
    <RecoilRoot>
      <InitializeState>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route element={<ProtectedRoute role={role} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/fooditems" element={<FoodItemsPage />} />
            <Route
              path="/admin"
              element={<UserManagementPage />}
              requiredRole="admin"
            />
          </Route>
        </Routes>
      </InitializeState>
    </RecoilRoot>
  );
}

export default App;
