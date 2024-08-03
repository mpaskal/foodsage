const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Tenant = require("../models/Tenant");

// Register First User (Admin)
const registerFirstUser = async (req, res) => {
  // Destructure the request body
  const { firstName, lastName, email, password } = req.body;

  // Check if the user already exists
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Create a new tenant
    const tenant = new Tenant({ name: email });
    await tenant.save();

    // Create a new user
    user = new User({
      firstName,
      lastName,
      email,
      password,
      tenantId: tenant._id,
      role: "admin",
    });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the user
    await user.save();

    // Create a JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        tenantId: user.tenantId,
      },
    };

    // Sign the token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
          },
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Register User (by Admin)
const registerUser = async (req, res) => {
  // Destructure the request body
  const { firstName, lastName, email, password, role } = req.body;

  // Check if the user already exists
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Create a new user
    user = new User({
      firstName,
      lastName,
      email,
      password,
      tenantId: req.user.tenantId,
      role: role || "user",
    });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the user
    await user.save();

    // Return the user
    res.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
};

// Login User
const login = async (req, res) => {
  console.log("Login request:", req.body);
  const { email, password } = req.body;

  try {
    console.log("Finding user with email:", email);
    console.log("MongoDB connected for user", process.env.MONGO_URI);
    let user = await User.findOne({ email });
    console.log("User found:", user);
    if (!user) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
        tenantId: user.tenantId,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 * 24 }, // Token expires in 24 hours
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
          },
        });
      }
    );
  } catch (err) {
    console.log("Login new error:", err.message);
    console.error("Login error:", err.message);
    res.status(500).send(err.message);
  }
};

// Get all users for the same tenant
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    console.log("Fetching users for tenantId:", req.user.tenantId);

    const users = await User.find({ tenantId: req.user.tenantId })
      .skip(skip)
      .limit(Number(limit))
      .select("-password");

    const total = await User.countDocuments({ tenantId: req.user.tenantId });

    console.log("Users fetched:", users.length);
    console.log("Total users for this tenant:", total);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({
      message: "Error fetching users in useController",
      error: error.message,
    });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
};

// Update user
const updateUser = async (req, res) => {
  const { firstName, lastName, email, role } = req.body;
  try {
    let user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Prevent the logged-in user from changing their own role
    if (req.user.id === req.params.id && user.role !== role) {
      return res.status(403).json({ msg: "You cannot change your own role." });
    }

    user = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email, role },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Delete user
const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check if this is the last admin user
    const adminUsers = await User.find({
      tenantId: user.tenantId,
      role: "admin",
    });
    const isLastAdmin = adminUsers.length === 1;

    if (isLastAdmin && user.role === "admin") {
      // Delete all users and tenant
      await User.deleteMany({ tenantId: user.tenantId });
      await Tenant.findByIdAndDelete(user.tenantId);
      return res.json({ msg: "All users and tenant deleted successfully" });
    } else {
      // Delete the user
      await User.findByIdAndDelete(userId);
      return res.json({ msg: "User deleted successfully" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

module.exports = {
  registerFirstUser,
  registerUser,
  login,
  getAllUsers,
  getUserProfile,
  updateUser,
  deleteUser,
};
