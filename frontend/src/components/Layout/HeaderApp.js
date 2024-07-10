import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useResetRecoilState } from "recoil";
import {
  FaSearch,
  FaQuestionCircle,
  FaCog,
  FaBell,
  FaUser,
} from "react-icons/fa";
import {
  loggedInUserState,
  usersState,
  adminUsersState,
  isLoadingState,
  totalPagesState,
  currentPageState,
  selectedUserState,
  isUserModalOpenState,
} from "../../recoil/userAtoms";

const HeaderApp = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const resetLoggedInUserState = useResetRecoilState(loggedInUserState);
  const resetUsersState = useResetRecoilState(usersState);
  const resetAdminUsersState = useResetRecoilState(adminUsersState);
  const resetIsLoadingState = useResetRecoilState(isLoadingState);
  const resetTotalPagesState = useResetRecoilState(totalPagesState);
  const resetCurrentPageState = useResetRecoilState(currentPageState);
  const resetSelectedUserState = useResetRecoilState(selectedUserState);
  const resetIsUserModalOpenState = useResetRecoilState(isUserModalOpenState);

  const handleSignOut = () => {
    resetLoggedInUserState();
    resetUsersState();
    resetAdminUsersState();
    resetIsLoadingState();
    resetTotalPagesState();
    resetCurrentPageState();
    resetSelectedUserState();
    resetIsUserModalOpenState();
    localStorage.clear();
    navigate("/");
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
      <div className="sidebar-logo">
        <img src="/logo_with_companyName_white.png" alt="FoodSage logo" className="logo-app" />
      </div>
      <div className="header-left">
        {/* <span className="space-name">Space Name</span> */}
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
