import {
  FaBox,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaGift,
  FaChartLine,
} from "react-icons/fa";
import { AiOutlineDashboard } from "react-icons/ai";

export const adminSidebarItems = [
  { name: "Dashboard", path: "/admin/dashboard", icon: AiOutlineDashboard },
  { name: "Tenant Management", path: "/admin/tenant-management", icon: FaBox },
  { name: "User Management", path: "/admin/user-management", icon: FaBox },
  {
    name: "Donation Management",
    path: "/admin/donation-management",
    icon: FaGift,
  },
  {
    name: "Report Management",
    path: "/admin/report-management",
    icon: FaChartLine,
  },
  {
    name: "Notification Management",
    path: "/admin/notification-management",
    icon: FaExclamationTriangle,
  },
  {
    name: "Sustainable Practice Management",
    path: "/admin/sustainable-practice-management",
    icon: FaChartLine,
  },
  {
    name: "Food Item Management",
    path: "/admin/food-item-management",
    icon: FaBox,
  },
  {
    name: "Cost Saving Insight Management",
    path: "/admin/cost-saving-insight-management",
    icon: FaMoneyBillWave,
  },
  {
    name: "Waste Record Management",
    path: "/admin/waste-record-management",
    icon: FaBox,
  },
  {
    name: "User Activity Log Management",
    path: "/admin/user-activity-log-management",
    icon: FaBox,
  },
];

export default adminSidebarItems;
