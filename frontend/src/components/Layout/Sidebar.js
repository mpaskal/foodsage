import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars } from "react-icons/fa";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`sidebar-wrapper ${isOpen ? "open" : ""}`}>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        <FaBars />
      </button>
      <div className="sidebar-app">
        <aside className="sidebar-content">
          <nav>
            <ul>
              <li>
                <Link to="/dashboard">Dashboard</Link>
              </li>
              <li>
                <Link to="/inventory">Inventory</Link>
                <ul>
                  <li>
                    <Link to="/inventory/all">All</Link>
                  </li>
                  <li>
                    <Link to="/inventory/high-risk-items">High-Risk Items</Link>
                  </li>
                  <li>
                    <Link to="/inventory/pantry-manager">Pantry Manager</Link>
                  </li>
                  <li>
                    <Link to="/inventory/stock-overview">Stock Overview</Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link to="/waste-goals">Waste Goals</Link>
                <ul>
                  <li>
                    <Link to="/waste-goals/waste-tracker">Waste Tracker</Link>
                  </li>
                  <li>
                    <Link to="/waste-goals/sustainability-goals">
                      Sustainability Goals
                    </Link>
                  </li>
                  <li>
                    <Link to="/waste-goals/waste-analysis">Waste Analysis</Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link to="/money-saving">Money Saving</Link>
              </li>
              <li>
                <Link to="/donation">Donation</Link>
              </li>
              <li>
                <Link to="/insights">Insights</Link>
              </li>
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  );
};

export default Sidebar;
