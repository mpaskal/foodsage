const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const http = require("http"); // Use the http module
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const tenantRoutes = require("./routes/tenantRoutes");
const foodItemRoutes = require("./routes/foodItemRoutes");

const app = express();

const WebSocket = require("ws");

// Create an HTTP server
const server = http.createServer(app);

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
app.use("/api/tenants", tenantRoutes);
app.use("/api/fooditems", foodItemRoutes); // Mount foodItemRoutes at /api/fooditems

const port = process.env.PORT || 5000;

server.listen(port, () => console.log(`Server running on port ${port}`));
