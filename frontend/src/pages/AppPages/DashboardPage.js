import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout/LayoutApp";
import Img1 from "../../assets/images/dashboard-img1.jpg";
import Img2 from "../../assets/images/dashboard-img2.jpg";

const DashboardPage = () => {
  const [user, setUser] = useState({});

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      setUser(JSON.parse(storedUser));
    }
  }, []);

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
