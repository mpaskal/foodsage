const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const foodItemRoutes = require("./routes/foodItemRoutes");
const wasteItemRoutes = require("./routes/wasteItemRoutes");

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

    FoodItem.init()
      .then(() => {
        console.log("Indexes ensured for FoodItem");
      })
      .catch((err) => {
        console.error("Error ensuring indexes for FoodItem", err);
      });
  })
  .catch((err) => console.log("MongoDB connection error:", err));

// Use Routes
app.use("/api/users", userRoutes); // Mount user routes at /api/users
app.use("/api/fooditems", foodItemRoutes); // Mount foodItemRoutes at /api/fooditems
app.use("/api/wasteItems", wasteItemRoutes); // Mount wasteItemRoutes at /api/wasteItems
//app.use("/api/wasteInsights", wasteItemRoutes); // Mount wasteItemRoutes at /api/wasteInsights

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
