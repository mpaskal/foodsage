import React from "react";
import HeaderAdmin from "./HeaderAdmin";
import SidebarAdmin from "./SidebarAdmin";
import FooterAdmin from "./FooterAdmin";
import "../../Admin.css";

const LayoutAdmin = ({ children }) => {
  return (
    <div className="layout-admin d-flex flex-column min-vh-100">
      <HeaderAdmin className="header-admin" />
      <div className="layout-admin-main d-flex">
        <SidebarAdmin className="custom-sidebar-admin" />
        <div className="layout-admin-content flex-grow-1 p-3">{children}</div>
      </div>
      <FooterAdmin className="footer-admin" />
    </div>
  );
};

export default LayoutAdmin;
