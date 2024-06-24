const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Tenant = require("../models/Tenant");

const router = express.Router();

// Validation
const validateRegisterInput = (data) => {
  let errors = {};

  if (!data.email || !data.password) {
    errors.email = "Email and Password are required";
  }

  if (data.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

router.post("/register", async (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    }

    // Create a new tenant
    const tenant = new Tenant({ name: `${firstName} ${lastName}'s Tenant` });
    await tenant.save();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      tenantId: tenant._id,
    });

    await user.save();

    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
