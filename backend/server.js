const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const users = require("./routes/users");
const adminAppRoutes = require("./routes/adminApp");
require("dotenv").config();

const app = express();

// Bodyparser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB Config
const db = process.env.MONGO_URI;

// Connect to MongoDB
mongoose
  .connect(db)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Routes
app.use("/api/users", users);
app.use("/api/adminApp", adminAppRoutes); // Note: No authentication middleware for login route

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
