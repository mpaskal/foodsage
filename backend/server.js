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
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "*",
    credentials: true,
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Increase the payload size limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    // Ensure indexes are created
    const FoodItem = require("./models/FoodItem");
    const WasteRecord = require("./models/WasteRecord");

    return Promise.all([FoodItem.init(), WasteRecord.init()]);
  })
  .then(() => {
    console.log("Indexes ensured for FoodItem and WasteRecord");
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/food/items", foodItemRoutes);
app.use("/api/food/insights", foodInsightRoutes);
app.use("/api/waste/items", wasteItemRoutes);
app.use("/api/waste/insights", wasteInsightRoutes);
app.use("/api/donation/items", donationItemRoutes);
app.use("/api/donation/insights", donationInsightRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Serve static files from the React app in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));

  // Handle React routing, return all requests to React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Handle unmatched routes
app.use((req, res, next) => {
  if (req.url.includes(".hot-update.json")) {
    res.status(404).end();
  } else {
    console.log(`Unmatched route: ${req.method} ${req.originalUrl}`);
    res.status(404).send("Not Found");
  }
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  app.close(() => {
    console.log("HTTP server closed");
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  });
});
