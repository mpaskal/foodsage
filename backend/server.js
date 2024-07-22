const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const foodItemRoutes = require("./routes/foodItemRoutes");
const foodInsightRoutes = require("./routes/foodInsightRoutes");
const wasteItemRoutes = require("./routes/wasteItemRoutes");
const wasteInsightRoutes = require("./routes/wasteInsightRoutes");
const donationItemRoutes = require("./routes/donationItemRoutes");
const donationInsightRoutes = require("./routes/donationInsightRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// DB Config
const db = process.env.MONGO_URI;

// Connect to MongoDB
mongoose
  .connect(db)
  .then(() => {
    console.log("MongoDB connected");

    // Ensure indexes are created
    const FoodItem = require("./models/FoodItem");
    const WasteRecord = require("./models/WasteRecord");

    Promise.all([FoodItem.init(), WasteRecord.init()])
      .then(() => {
        console.log("Indexes ensured for FoodItem and WasteRecord");
      })
      .catch((err) => {
        console.error("Error ensuring indexes", err);
      });
  })
  .catch((err) => console.log("MongoDB connection error:", err));

// Use Routes
app.use("/api/users", userRoutes);
app.use("/api/food/items", foodItemRoutes);
app.use("/api/food/insights", foodInsightRoutes);
app.use("/api/waste/items", wasteItemRoutes);
app.use("/api/waste/insights", wasteInsightRoutes);
app.use("/api/donation/items", donationItemRoutes);
app.use("/api/donation/insights", donationInsightRoutes);
app.use("/api/dashboard", dashboardRoutes);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));

app.use((req, res, next) => {
  console.log(`Unmatched route: ${req.method} ${req.originalUrl}`);
  next();
});
