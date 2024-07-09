import React from "react";
import { NavLink } from "react-router-dom";

const Header = () => {
  return (
    <header className="header-site">
      <img src="/logo_with_companyName2.png" alt="FoodSage Logo" className="logo" />
      <nav className="navbar">
        <ul className="navbar-links">
          <li>
            <NavLink
              end
              to="/"
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              About
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              Contact
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/signin"
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              Sign In
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/signup"
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              Sign Up
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
