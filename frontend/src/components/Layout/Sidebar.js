import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { sidebarItems } from "../../data/sidebarItems";
import { FaChevronLeft, FaChevronRight, FaUser } from "react-icons/fa";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";

const Sidebar = () => {
  const location = useLocation();
  const [expanded, setExpanded] = useState(window.innerWidth > 768);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setExpanded(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const paths = location.pathname.split("/").filter((x) => x);
    const openItems = {};

    paths.forEach((path, index) => {
      const fullPath = "/" + paths.slice(0, index + 1).join("/");
      sidebarItems.forEach((item) => {
        if (
          item.path === fullPath ||
          (item.items &&
            item.items.some((subItem) => subItem.path === fullPath))
        ) {
          openItems[item.name] = true;
        }
      });
    });

    setExpandedItems(openItems);
  }, [location]);

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const toggleSidebar = () => {
    setExpanded(!expanded);
    if (!expanded) {
      setExpandedItems({});
    }
  };

  const toggleItem = (itemName) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  const SidebarLink = ({ to, children, onClick }) => (
    <NavLink
      to={to}
      className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      {children}
    </NavLink>
  );

  return (
    <div className={`sidebar ${expanded ? "expanded" : "collapsed"}`}>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {expanded ? <FaChevronLeft /> : <FaChevronRight />}
      </button>
      <div className="sidebar-items">
        {sidebarItems.map((item, index) => (
          <div key={index} className="sidebar-item">
            {item.items ? (
              <div className="sidebar-dropdown">
                <div
                  className={`sidebar-link ${
                    expandedItems[item.name] ? "expanded" : ""
                  }`}
                  onClick={() => toggleItem(item.name)}
                >
                  <item.icon className="sidebar-icon" />
                  <span>{item.name}</span>
                  {expandedItems[item.name] ? (
                    <BiChevronUp />
                  ) : (
                    <BiChevronDown />
                  )}
                </div>
                {expandedItems[item.name] && (
                  <div className="sidebar-dropdown-content">
                    {item.items.map((subItem, subIndex) => (
                      <SidebarLink key={subIndex} to={subItem.path}>
                        <span>{subItem.name}</span>
                      </SidebarLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <SidebarLink to={item.path}>
                <item.icon className="sidebar-icon" />
                <span>{item.name}</span>
              </SidebarLink>
            )}
          </div>
        ))}
        {role === "admin" && (
          <div className="sidebar-item">
            <div className="sidebar-dropdown">
              <div
                className={`sidebar-link ${
                  expandedItems["Admin Panel"] ? "expanded" : ""
                }`}
                onClick={() => toggleItem("Admin Panel")}
              >
                <FaUser className="sidebar-icon" />
                <span>Admin Panel</span>
                {expandedItems["Admin Panel"] ? (
                  <BiChevronUp />
                ) : (
                  <BiChevronDown />
                )}
              </div>
              {expandedItems["Admin Panel"] && (
                <div className="sidebar-dropdown-content">
                  <SidebarLink to="/users">
                    <span>User Management</span>
                  </SidebarLink>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
