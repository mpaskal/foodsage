import React from "react";
import { Link } from "react-router-dom";

const FooterApp = () => {
  return (
    <footer className="footer-app">
      <div className="footer-section">
        <h4>About</h4>
        <ul>
          <li>
            <a href="/about">Our Story</a>
          </li>
          <li>
            <a href="/mission-vision">Mission and Vision</a>
          </li>
        </ul>
      </div>
      <div className="footer-section">
        <h4>Privacy policy</h4>
        <ul>
          <li>
            <a href="/user-rights">User Rights</a>
          </li>
          <li>
            <a href="/cookies-policy">Cookies Policy</a>
          </li>
        </ul>
      </div>
      <div className="footer-section">
        <h4>Support</h4>
        <ul>
          <li>
            <a href="/faq">FAQ</a>
          </li>
          <li>
            <a href="/help">Help</a>
          </li>
        </ul>
      </div>
      <div className="footer-section">
        <h4>Contact us</h4>
        <ul>
          <li>
            <a href="/contact">Contact</a>
          </li>
          <li>
            <a href="/feedback">Feedback</a>
          </li>
        </ul>
      </div>
      <p>© 2024, FoodSage</p>
    </footer>
  );
};

export default FooterApp;
