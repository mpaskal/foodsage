import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header>
      <img src="/logo.png" alt="FoodSage" className="logo" />
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
