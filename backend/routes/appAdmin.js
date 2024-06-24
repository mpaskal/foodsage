const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AppAdmin = require("../models/AppAdmin");
const AppAdminAuth = require("../middlewares/AppAdminAuth");
const router = express.Router();
require("dotenv").config();

// POST /api/AppAdmin/login - AppAdmin login (no auth middleware needed)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const AppAdmin = await AppAdmin.findOne({ email });
    if (!AppAdmin) {
      return res.status(404).json({ email: "Email not found" });
    }

    const isMatch = await bcrypt.compare(password, AppAdmin.password);
    if (!isMatch) {
      return res.status(400).json({ password: "Password incorrect" });
    }

    const payload = {
      id: AppAdmin.id,
      loginName: AppAdmin.loginName,
      permissions: AppAdmin.permissions,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: 3600,
    });

    res.json({ success: true, token: "Bearer " + token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/AppAdmin/users - Get all AppAdmin users (protected route)
router.get("/users", AppAdminAuth, async (req, res) => {
  try {
    const AppAdmins = await AppAdmin.find();
    res.json(AppAdmins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
