import React from "react";
import HeaderApp from "./HeaderApp";
import Sidebar from "./Sidebar";
import FooterApp from "./FooterApp";

const LayoutApp = ({ children }) => {
  return (
    <div className="layout-app d-flex flex-column min-vh-100">
      <HeaderApp className="header-app" />
      <div className="layout-app-main d-flex flex-grow-1">
        <Sidebar />
        <div className="layout-app-content flex-grow-1 p-3 overflow-auto">
          {children}
        </div>
      </div>
      <FooterApp className="footer-app" />
    </div>
  );
};

export default LayoutApp;
