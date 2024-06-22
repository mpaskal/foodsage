import {
  cilList,
  cilWarning,
  cilBasket,
  cilChart,
  cilTrash,
  cilMoney,
  cilGift,
  cilLightbulb,
} from "@coreui/icons";

const sidebarItems = [
  {
    name: "Inventory",
    icon: cilList,
    items: [
      { name: "All", path: "/inventory/all" },
      { name: "High-Risk Items", path: "/inventory/high-risk-items" },
      { name: "Pantry Manager", path: "/inventory/pantry-manager" },
      { name: "Stock Overview", path: "/inventory/stock-overview" },
    ],
  },
  {
    name: "Waste Goals",
    icon: cilTrash,
    items: [
      { name: "Waste Tracker", path: "/waste-goals/waste-tracker" },
      {
        name: "Sustainability Goals",
        path: "/waste-goals/sustainability-goals",
      },
      { name: "Waste Analysis", path: "/waste-goals/waste-analysis" },
    ],
  },
  {
    name: "Money Saving",
    path: "/money-saving",
    icon: cilMoney,
  },
  {
    name: "Donation",
    path: "/donation",
    icon: cilGift,
  },
  {
    name: "Insights",
    path: "/insights",
    icon: cilLightbulb,
  },
];

export default sidebarItems;
