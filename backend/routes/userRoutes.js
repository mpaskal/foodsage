const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const userAuth = require("../middlewares/userAuth");
const requireRole = require("../middlewares/requireRole");

// Register a new admin
router.post("/register", userController.registerAdmin);

// Register a new user (admin only)
router.post(
  "/register-user",
  userAuth,
  requireRole("admin"),
  userController.registerUser
);

// Login user
router.post("/login", userController.loginUser);

// Get all users (admin only)
router.get("/", userAuth, requireRole("admin"), userController.getAllUsers);

module.exports = router;
