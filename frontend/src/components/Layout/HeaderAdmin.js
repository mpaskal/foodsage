import React from "react";
import "../../Admin.css";

const HeaderAdmin = () => {
  return (
    <header className="header-admin">
      <div className="header-left-admin">
        <img src="/logo2.jpg" alt="FoodSage" className="logo-admin" />
        <span className="space-name-admin">Admin Panel</span>
      </div>
      <div className="header-right-admin">
        {/* Add admin specific header items here */}
      </div>
    </header>
  );
};

export default HeaderAdmin;
