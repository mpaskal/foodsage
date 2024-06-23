import React, { useState } from "react";
import { sidebarItems } from "../../data/sidebarItems";
import { NavLink } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { BiChevronDown } from "react-icons/bi";
import { BiChevronUp } from "react-icons/bi";
// Make sure to create this CSS file

const Sidebar = () => {
  const [expanded, setExpanded] = useState(true);
  const [expandedItems, setExpandedItems] = useState([]);

  const toggleSidebar = () => {
    setExpanded(!expanded);
    // Close all expanded items when collapsing sidebar
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
      // Expand sidebar if it's collapsed and an item is clicked
      setExpanded(true);
      setExpandedItems({ [itemName]: true });
    }
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
      </div>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {expanded ? <FaChevronLeft /> : <FaChevronRight />}
      </button>
    </div>
  );
};

export default Sidebar;
