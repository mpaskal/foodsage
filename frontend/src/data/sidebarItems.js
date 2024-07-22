import { AiOutlineDashboard } from "react-icons/ai";
import { MdOutlineInventory } from "react-icons/md";
import { FcExpired } from "react-icons/fc";
import { GiFoodTruck, GiReceiveMoney } from "react-icons/gi";

export const sidebarItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: AiOutlineDashboard,
  },
  {
    name: "Food Management",
    icon: MdOutlineInventory,
    items: [
      { name: "Food Tracker", path: "/fooditems" },
      { name: "Food Insights", path: "/foodinsights" },
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
    name: "Donations Management",
    icon: GiFoodTruck,
    items: [
      { name: "Donation Tracker", path: "/donationitems" },
      { name: "Donation Insights", path: "/donationinsights" },
    ],
  },

  {
    name: "Money Management",
    icon: GiReceiveMoney,
    items: [{ name: "Savings Tracker", path: "/savings" }],
  },
];
