import React from "react";
import { NavLink } from "react-router-dom";

const Header = () => {
  return (
    <header>
      <img src="/logo.png" alt="FoodSage Logo" className="logo" />
      <nav className="navbar">
        <ul className="navbar-links">
          <li>
            <NavLink exact to="/" activeClassName="active">
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" activeClassName="active">
              About
            </NavLink>
          </li>
          <li>
            <NavLink to="/contact" activeClassName="active">
              Contact
            </NavLink>
          </li>
          <li>
            <NavLink to="/signin" activeClassName="active">
              Sign In
            </NavLink>
          </li>
          <li>
            <NavLink to="/signup" activeClassName="active">
              Sign Up
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
