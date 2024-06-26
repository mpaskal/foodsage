import React, { useState, useEffect, useRef } from "react";
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
  const dropdownRef = useRef(null);

  const handleSignOut = () => {
    localStorage.removeItem("user");
    navigate("/signin");
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownVisible(!dropdownVisible);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        <div className="user-dropdown" ref={dropdownRef}>
          <FaUser onClick={toggleDropdown} className="user-icon" />
          {dropdownVisible && (
            <div
              className={`dropdown-menu ${dropdownVisible ? "visible" : ""}`}
            >
              <button onClick={handleSignOut}>Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderApp;
