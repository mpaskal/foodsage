import React from "react";
import { Link } from "react-router-dom";

const Footer = (props) => {
  return (
    <footer>
      <small className="copyright">
        <p>Copyright &copy; {props.year} FoodSage</p>
      </small>
    </footer>
  );
};

export default Footer;
