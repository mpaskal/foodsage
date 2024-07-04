const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const tenantRoutes = require("./routes/tenantRoutes");
const foodItemRoutes = require("./routes/foodItemRoutes");

const app = express();

const WebSocket = require("ws");

const wss = new WebSocket.Server({ noServer: true });

server.on("upgrade", function upgrade(request, socket, head) {
  wss.handleUpgrade(request, socket, head, function done(ws) {
    wss.emit("connection", ws, request);
  });
});

wss.on("connection", function connection(ws) {
  ws.on("message", function message(data) {
    console.log("received: %s", data);
  });

  ws.send("something");
});

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
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Use Routes
app.use("/api/users", userRoutes); // Mount user routes at /api/users
app.use("/api/tenants", tenantRoutes);
app.use("/api/fooditems", foodItemRoutes); // Mount foodItemRoutes at /api/fooditems

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
