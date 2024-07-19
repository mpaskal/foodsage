export const categories = [
  "Dairy",
  "Fresh",
  "Grains and Bread",
  "Packaged and Snack Foods",
  "Frozen Goods",
  "Other",
];

export const statusOptions = [
  "Active",
  "Inactive",
  "Consumed",
  "Waste",
  "Donation",
  "Donated",
];

export const storages = ["Fridge", "Freezer", "Pantry", "Cellar"];

export const quantityMeasurementsByCategory = {
  Dairy: ["L", "Oz", "Item"],
  Fresh: ["Gr", "Oz", "Item", "Kg", "Lb"],
  "Grains and Bread": ["Item", "Kg", "Lb", "Gr", "Box"],
  "Packaged and Snack Foods": ["Item", "Box", "Kg", "Lb", "Gr"],
  "Frozen Goods": ["Kg", "Lb", "Item"],
  Other: ["Item", "Kg", "Lb", "L", "Oz", "Gr", "Box"],
};

export const sharedTableColumns = [
  { key: "image", label: "Image", type: "file" },
  { key: "name", label: "Name", type: "text" },
  { key: "category", label: "Category", type: "select", options: categories },
  { key: "quantity", label: "Qty", type: "number" },
  { key: "quantityMeasurement", label: "Meas", type: "select" },
  { key: "storage", label: "Storage", type: "select", options: storages },
  { key: "cost", label: "Cost", type: "number" },
  { key: "source", label: "Source", type: "text" },
  { key: "expirationDate", label: "Expiration Date", type: "date" },
  { key: "purchasedDate", label: "Purchased Date", type: "date" },
  { key: "consumed", label: "Consumed (%)", type: "number" },
  { key: "status", label: "Status", type: "select", options: statusOptions },
];
