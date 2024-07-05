const express = require("express");
const router = express.Router();
const userAuth = require("../middlewares/userAuth");
const userController = require("../controllers/userController");
const User = require("../models/User");

router.post("/register", userController.registerFirstUser);
router.post("/register-user", userAuth, userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/", userAuth, userController.getAllUsers);
router.get("/profile", userAuth, userController.getUserProfile);
router.put("/:id", userAuth, userController.updateUser);
router.delete("/:id", userAuth, userController.deleteUser);

// Add this new route for /admin
router.get("/admin", userAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    const admin = await User.findById(req.user.id).select("-password");
    res.json(admin);
  } catch (error) {
    console.error("Error in GET /api/users/admin:", error);
    res.status(500).json({
      message: "Error fetching admin information",
      error: error.message,
    });
  }
});

module.exports = router;
