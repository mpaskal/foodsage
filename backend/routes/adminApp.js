const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AdminApp = require("../models/AdminApp");
const adminAppAuth = require("../middlewares/adminAppAuth");
const router = express.Router();
require("dotenv").config();

// POST /api/adminApp/login - AdminApp login (no auth middleware needed)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminApp = await AdminApp.findOne({ email });
    if (!adminApp) {
      return res.status(404).json({ email: "Email not found" });
    }

    const isMatch = await bcrypt.compare(password, adminApp.password);
    if (!isMatch) {
      return res.status(400).json({ password: "Password incorrect" });
    }

    const payload = {
      id: adminApp.id,
      loginName: adminApp.loginName,
      permissions: adminApp.permissions,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: 3600,
    });

    res.json({ success: true, token: "Bearer " + token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/adminApp/users - Get all adminApp users (protected route)
router.get("/users", adminAppAuth, async (req, res) => {
  try {
    const adminApps = await AdminApp.find();
    res.json(adminApps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
