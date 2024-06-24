const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Tenant = require("../models/Tenant");

// User registration route
router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Create tenant
    const tenant = new Tenant({ name: email });
    await tenant.save();

    // Create user
    user = new User({
      firstName,
      lastName,
      email,
      password,
      tenantId: tenant._id,
      role: "admin", // Default role as admin for new registrations
    });

    await user.save();

    res.status(201).json({ msg: "User registered successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
