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
      { name: "All", path: "/fooditems" },
      { name: "High-Risk Items", path: "/fooditems/high-risk-items" },
      { name: "Pantry Manager", path: "/fooditems/pantry-manager" },
      { name: "Stock Overview", path: "/fooditems/stock-overview" },
    ],
  },
  {
    name: "Waste Goals",
    icon: FcExpired,
    items: [
      { name: "Waste Tracker", path: "/waste-goals/waste-tracker" },
      {
        name: "Sustainability Goals",
        path: "/waste-goals/sustainability-goals",
      },
      { name: "Waste Analysis", path: "/waste-goals/waste-analysis" },
    ],
  },
  { name: "Money Saving", path: "/money-saving", icon: GiReceiveMoney },
  { name: "Donation", path: "/donation", icon: GiFoodTruck },
  { name: "Insights", path: "/insights", icon: MdOutlineInsights },
];

export default sidebarItems;
