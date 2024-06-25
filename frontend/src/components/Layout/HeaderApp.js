import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaQuestionCircle,
  FaCog,
  FaBell,
  FaUser,
} from "react-icons/fa";

const HeaderApp = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("user");
    navigate("/signin");
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  return (
    <header className="header-app">
      <div className="header-left">
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
        <div className="user-dropdown">
          <FaUser onClick={toggleDropdown} className="user-icon" />
          {dropdownVisible && (
            <div className="dropdown-menu">
              <button onClick={handleSignOut}>Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderApp;
