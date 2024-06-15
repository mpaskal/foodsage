import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header>
      <img src="/logo.png" alt="FoodSage Logo" className="logo" />
      <nav className="navbar">
        <ul className="navbar-links">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
          <li>
            <Link to="/signin">Sign In</Link>
          </li>
          <li>
            <Link to="/signup">Sign Up</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
