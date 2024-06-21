import React from "react";
import { Link } from "react-router-dom";

const FooterApp = () => {
  return (
    <footer className="footer-app">
      <div className="footer-section">
        <h4>About</h4>
        <ul>
          <li>
            <Link to="/about">Our Story</Link>
          </li>
          <li>
            <Link to="/mission-vision">Mission and Vision</Link>
          </li>
        </ul>
      </div>
      <div className="footer-section">
        <h4>Privacy policy</h4>
        <ul>
          <li>
            <Link to="/user-rights">User Rights</Link>
          </li>
          <li>
            <Link to="/cookies-policy">Cookies Policy</Link>
          </li>
        </ul>
      </div>
      <div className="footer-section">
        <h4>Support</h4>
        <ul>
          <li>
            <Link to="/faq">FAQ</Link>
          </li>
          <li>
            <Link to="/help">Help</Link>
          </li>
        </ul>
      </div>
      <div className="footer-section">
        <h4>Contact us</h4>
        <ul>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
          <li>
            <Link to="/feedback">Feedback</Link>
          </li>
        </ul>
      </div>
      <p>© 2024, FoodSage</p>
    </footer>
  );
};

export default FooterApp;
