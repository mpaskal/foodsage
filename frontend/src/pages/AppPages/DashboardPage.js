import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../../components/Layout/LayoutApp";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { loggedInUserState } from "../../recoil/userAtoms";
import Img1 from "../../assets/images/dashboard-img1.jpg";
import Img2 from "../../assets/images/dashboard-img2.jpg";

const DashboardPage = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const setLoggedInUser = useSetRecoilState(loggedInUserState);
  const user = useRecoilValue(loggedInUserState);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(storedUser);
        setLoggedInUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        setError("There was an error loading your user data.");
        toast.error("There was an error loading your user data.");
      }
    } else {
      setError("No user data found. Please sign in.");
      toast.info("No user data found. Please sign in.", {
        onClose: () => navigate("/signin"),
        autoClose: 5000,
      });
    }
  }, [setLoggedInUser, navigate]);

  if (error) {
    return (
      <Layout>
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard">
        <div className="welcome-section">
          <h1>
            Welcome to Food Sage application, {user.firstName} {user.lastName}!
          </h1>
        </div>
        <div className="image-container">
          <img src={Img1} alt="Graph1" />
          <img src={Img2} alt="Graph2" />
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
