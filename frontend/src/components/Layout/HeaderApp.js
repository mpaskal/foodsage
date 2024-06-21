import React from "react";

import {
  FaSearch,
  FaQuestionCircle,
  FaCog,
  FaBell,
  FaUser,
} from "react-icons/fa";

const HeaderApp = () => {
  return (
    <header className="header-app">
      <div className="header-left">
        <img src="/logo.png" alt="FoodSage" className="logo" />
        <span className="space-name">Space Name</span>
      </div>
      <div className="header-right">
        <div className="search-bar">
          <input type="text" placeholder="Search..." />
          <button type="button">
            <FaSearch />
          </button>
        </div>
        <FaQuestionCircle />
        <FaCog />
        <FaBell />
        <FaUser />
      </div>
    </header>
  );
};

export default HeaderApp;
