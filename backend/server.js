const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const tenantRoutes = require("./routes/tenantRoutes");
const foodItemRoutes = require("./routes/foodItemRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB Config
const db = process.env.MONGO_URI;

// Connect to MongoDB
mongoose
  .connect(db)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Use Routes
app.use("/api", userRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api", foodItemRoutes);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
