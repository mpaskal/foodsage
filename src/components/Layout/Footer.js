import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer>
      <div>
        <h4>About</h4>
        <ul>
          <li>
            <Link to="/about">Our Story</Link>
          </li>
        </ul>
      </div>
      <p>© 2024, FoodSage</p>
    </footer>
  );
};

export default Footer;
