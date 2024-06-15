import React from "react";
import Header from "./HeaderSite";
import Footer from "./FooterSite";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <div className="layout-content">
        <main>{children}</main>
      </div>
      <Footer year={new Date().getFullYear()} />
    </div>
  );
};

export default Layout;
