import {
  FaBox,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaGift,
  FaChartLine,
  FaUserAlt,
} from "react-icons/fa";
import { AiOutlineDashboard } from "react-icons/ai";
import { GiReceiveMoney, GiFoodTruck } from "react-icons/gi";
import { MdOutlineInventory, MdOutlineInsights } from "react-icons/md";
import { FcExpired } from "react-icons/fc";

export const sidebarItems = [
  { name: "Dashboard", path: "/dashboard", icon: AiOutlineDashboard },
  {
    name: "Inventory",
    icon: MdOutlineInventory,
    items: [
      { name: "Food Tracker", path: "/fooditems" },
      { name: "High-Risk Items", path: "/fooditems/high-risk-items" },
      { name: "Pantry Manager", path: "/fooditems/pantry-manager" },
      { name: "Stock Overview", path: "/fooditems/stock-overview" },
    ],
  },
  {
    name: "Waste",
    icon: FcExpired,
    items: [
      { name: "Waste Tracker", path: "/wasteitems" },
      {
        name: "Waste Insights",
        path: "/wasteinsights",
      },
    ],
  },
  {
    name: "Donation",
    icon: GiFoodTruck,
    items: [
      { name: "Donation Tracker", path: "/donationitems" },
      {
        name: "Donation Insights",
        path: "/donationinsights",
      },
    ],
  },
  {
    name: "Money Saving",
    icon: GiReceiveMoney,
    items: [
      { name: "Money Saving Tracker", path: "/money" },
      {
        name: "Money Saving Insights",
        path: "/moneyinsights",
      },
    ],
  },
];

export default sidebarItems;
