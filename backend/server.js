const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const users = require("./routes/users");
const AppAdminRoutes = require("./routes/AppAdmin");
const protectedRoute = require("./routes/protectedRoute");
require("dotenv").config();

const app = express();

// Bodyparser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB Config
const db = process.env.MONGO_URI;

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Routes
app.use("/api/users", users);
app.use("/api/AppAdmin", AppAdminRoutes); // Note: No authentication middleware for login route
app.use("/api/protected", protectedRoute); // Protected routes requiring authentication and tenant association

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
