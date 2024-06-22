import React, { useState } from "react";
import sidebarItems from "../../data/sidebarItems";
import {
  CSidebar,
  CSidebarNav,
  CNavGroup,
  CNavItem,
  CNavLink,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { FaBars } from "react-icons/fa";

const Sidebar = () => {
  const [visible, setVisible] = useState(true);

  const toggleSidebar = () => {
    setVisible(!visible);
  };

  return (
    <>
      <CSidebar className={`custom-sidebar ${visible ? "visible" : "hidden"}`}>
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
      <button
        className={`sidebar-toggle ${visible ? "visible" : "hidden"}`}
        onClick={toggleSidebar}
      >
        <FaBars />
      </button>
    </>
  );
};

export default Sidebar;
