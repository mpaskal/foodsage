import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <aside>
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
                <Link to="/inventory/high-risk">High-Risk Items</Link>
                <ul>
                  <li>
                    <Link to="/inventory/high-risk/greenery-fruits">
                      Greenery & Fruits
                    </Link>
                  </li>
                  <li>
                    <Link to="/inventory/high-risk/bread-products">
                      Bread Products
                    </Link>
                  </li>
                  <li>
                    <Link to="/inventory/high-risk/dairy-products">
                      Dairy Products
                    </Link>
                  </li>
                  <li>
                    <Link to="/inventory/high-risk/sauces">Sauces</Link>
                  </li>
                  <li>
                    <Link to="/inventory/high-risk/meats">Meats</Link>
                  </li>
                  <li>
                    <Link to="/inventory/high-risk/prepared-foods">
                      Prepared Foods
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link to="/inventory/add-custom">+ Add custom</Link>
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
  );
};

export default Sidebar;
