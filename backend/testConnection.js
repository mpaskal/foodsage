const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables from .env file

const db = process.env.MONGO_URI; // Get the MongoDB URI from environment variables

// Connect to MongoDB
mongoose
  .connect(db)
  .then(() => {
    console.log("MongoDB connected successfully");
    mongoose.connection.close(); // Close the connection after success
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
