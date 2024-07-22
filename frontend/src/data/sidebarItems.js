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
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: AiOutlineDashboard,
    items: [
      { name: "Overview", path: "/dashboard" },
      { name: "Key Metrics", path: "/dashboard/metrics" },
    ],
  },
  {
    name: "Inventory",
    icon: MdOutlineInventory,
    items: [
      { name: "Inventory Tracker", path: "/foodItems" },
      { name: "Inventory Insights", path: "/foodinsights" },
    ],
  },
  {
    name: "Waste Management",
    icon: FcExpired,
    items: [
      { name: "Waste Tracker", path: "/wasteitems" },
      { name: "Waste Insights", path: "/wasteinsights" },
    ],
  },
  {
    name: "Donations",
    icon: GiFoodTruck,
    items: [
      { name: "Donation Tracker", path: "/donationitems" },
      { name: "Donation Insights", path: "/donationinsights" },
    ],
  },
  {
    name: "Financial Insights",
    icon: GiReceiveMoney,
    items: [{ name: "Savings Tracker", path: "/savings" }],
  },
];

export default sidebarItems;
