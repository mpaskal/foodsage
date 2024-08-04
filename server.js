require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const userRoutes = require("./backend/routes/userRoutes");
const foodItemRoutes = require("./backend/routes/foodItemRoutes");
const foodInsightRoutes = require("./backend/routes/foodInsightRoutes");
const wasteItemRoutes = require("./backend/routes/wasteItemRoutes");
const wasteInsightRoutes = require("./backend/routes/wasteInsightRoutes");
const donationItemRoutes = require("./backend/routes/donationItemRoutes");
const donationInsightRoutes = require("./backend/routes/donationInsightRoutes");
const dashboardRoutes = require("./backend/routes/dashboardRoutes");

const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "http://localhost:3000",
      "https://foodsage-app-fd38a67f3d3e.herokuapp.com",
    ].filter(Boolean);

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "backend/uploads")));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

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
  app.use(express.static(path.join(__dirname, "frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// Handle unmatched routes
app.use((req, res) => {
  if (req.url.includes(".hot-update.json")) {
    res.status(404).end();
  } else {
    console.log(`Unmatched route: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: "Not Found" });
  }
});

const port = process.env.PORT || 5000;

const server = app.listen(port, () =>
  console.log(`Server running on port ${port}`)
);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  });
});
