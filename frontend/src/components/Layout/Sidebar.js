import React, { useState, useEffect } from "react";
import { sidebarItems } from "../../data/sidebarItems";
import { NavLink } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaUser } from "react-icons/fa";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";

const Sidebar = () => {
  const [expanded, setExpanded] = useState(window.innerWidth > 768);
  const [expandedItems, setExpandedItems] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setExpanded(false);
      }
    };

    window.addEventListener("resize", handleResize);

    // Clean up event listener
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const toggleSidebar = () => {
    setExpanded(!expanded);
    if (expanded) {
      setExpandedItems({});
    }
  };

  const toggleItem = (itemName) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  return (
    <div className={`sidebar ${expanded ? "expanded" : "collapsed"}`}>
      <div className="sidebar-logo">
        <img src="/logo2.jpg" alt="FoodSage logo" className="logo" />
      </div>
      <div className="sidebar-items">
        {sidebarItems.map((item, index) => (
          <div key={index} className="sidebar-item">
            {item.items ? (
              <div className="sidebar-dropdown">
                <div
                  className="sidebar-link"
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
                      <NavLink
                        key={subIndex}
                        to={subItem.path}
                        className="sidebar-sublink"
                      >
                        <span>{subItem.name}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink to={item.path} className="sidebar-link">
                <item.icon className="sidebar-icon" />
                <span>{item.name}</span>
              </NavLink>
            )}
          </div>
        ))}
        {role === "admin" && (
          <div className="sidebar-item">
            <div className="sidebar-dropdown">
              <div
                className="sidebar-link"
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
                  <NavLink to="/users" className="sidebar-sublink">
                    <span>User Management</span>
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {expanded ? <FaChevronLeft /> : <FaChevronRight />}
      </button>
    </div>
  );
};

export default Sidebar;
