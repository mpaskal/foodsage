import React, { useState } from "react";
import sidebarItems from "../../data/sidebarItems"; // Ensure correct import path
import {
  CSidebar,
  CSidebarNav,
  CSidebarToggler,
  CNavGroup,
  CNavItem,
  CNavLink,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";

const Sidebar = () => {
  const [sidebarShow, setSidebarShow] = useState(true);

  return (
    <CSidebar
      show={sidebarShow}
      onShowChange={(val) => setSidebarShow(val)}
      className="custom-sidebar"
    >
      <CSidebarToggler
        className="d-lg-none"
        onClick={() => setSidebarShow(!sidebarShow)}
      />
      <CSidebarNav className="custom-sidenav-group">
        {sidebarItems.map((item, index) =>
          item.items ? (
            <CNavGroup
              key={index}
              toggler={item.name}
              icon={<CIcon icon={item.icon} customClassName="nav-icon" />}
            >
              {item.items.map((subItem, subIndex) => (
                <CNavItem key={subIndex}>
                  <CNavLink href={subItem.path}>{subItem.name}</CNavLink>
                </CNavItem>
              ))}
            </CNavGroup>
          ) : (
            <CNavItem key={index}>
              <CNavLink
                href={item.path}
                icon={<CIcon icon={item.icon} customClassName="nav-icon" />}
              >
                {item.name}
              </CNavLink>
            </CNavItem>
          )
        )}
      </CSidebarNav>
    </CSidebar>
  );
};

export default Sidebar;
