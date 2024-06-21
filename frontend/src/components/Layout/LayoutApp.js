import React from "react";
import HeaderApp from "./HeaderApp";
import Sidebar from "./Sidebar";
import FooterApp from "./FooterApp";

const LayoutApp = ({ children }) => {
  return (
    <div className="layout-app">
      <HeaderApp />
      <div className="layout-app-main">
        <Sidebar />
        <div className="layout-app-content">{children}</div>
      </div>
      <FooterApp />
    </div>
  );
};

export default LayoutApp;
