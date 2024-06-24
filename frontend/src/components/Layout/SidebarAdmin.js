import React, { useState } from "react";
import { adminSidebarItems } from "../../data/adminSidebarItems";
import { NavLink } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { BiChevronDown } from "react-icons/bi";
import { BiChevronUp } from "react-icons/bi";
import "../../Admin.css";

const SidebarAdmin = () => {
  const [expanded, setExpanded] = useState(true);
  const [expandedItems, setExpandedItems] = useState([]);

  const toggleSidebar = () => {
    setExpanded(!expanded);
    if (expanded) {
      setExpandedItems({});
    }
  };

  const toggleItem = (itemName) => {
    if (expanded) {
      setExpandedItems((prev) => ({
        ...prev,
        [itemName]: !prev[itemName],
      }));
    } else {
      setExpanded(true);
      setExpandedItems({ [itemName]: true });
    }
  };

  return (
    <div
      className={`sidebar-admin ${
        expanded ? "expanded-admin" : "collapsed-admin"
      }`}
    >
      <div className="sidebar-logo-admin">
        <img src="/logo2.jpg" alt="FoodSage logo" className="logo-admin" />
      </div>
      <div className="sidebar-items-admin">
        {adminSidebarItems.map((item, index) => (
          <div key={index} className="sidebar-item-admin">
            {item.items ? (
              <div className="sidebar-dropdown-admin">
                <div
                  className="sidebar-link-admin"
                  onClick={() => toggleItem(item.name)}
                >
                  <item.icon className="sidebar-icon-admin" />
                  <span>{item.name}</span>
                  {expandedItems[item.name] ? (
                    <BiChevronUp />
                  ) : (
                    <BiChevronDown />
                  )}
                </div>
                {expandedItems[item.name] && (
                  <div className="sidebar-dropdown-content-admin">
                    {item.items.map((subItem, subIndex) => (
                      <NavLink
                        key={subIndex}
                        to={subItem.path}
                        className="sidebar-sublink-admin"
                      >
                        <span>{subItem.name}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink to={item.path} className="sidebar-link-admin">
                <item.icon className="sidebar-icon-admin" />
                <span>{item.name}</span>
              </NavLink>
            )}
          </div>
        ))}
      </div>
      <button className="sidebar-toggle-admin" onClick={toggleSidebar}>
        {expanded ? <FaChevronLeft /> : <FaChevronRight />}
      </button>
    </div>
  );
};

export default SidebarAdmin;
