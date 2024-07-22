import { AiOutlineDashboard } from "react-icons/ai";
import { MdOutlineInventory } from "react-icons/md";
import { FcExpired } from "react-icons/fc";
import { GiFoodTruck, GiReceiveMoney } from "react-icons/gi";

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
      { name: "Inventory Tracker", path: "/fooditems" },
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
