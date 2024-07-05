const express = require("express");
const router = express.Router();
const userAuth = require("../middlewares/userAuth");
const userController = require("../controllers/userController");
const User = require("../models/User");

router.post("/register", userController.registerFirstUser);
router.post("/register-user", userAuth, userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/", userAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find({ tenantId: req.user.tenantId })
      .skip(skip)
      .limit(Number(limit))
      .select("-password");

    const total = await User.countDocuments({ tenantId: req.user.tenantId });

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    console.error("Error in GET /api/users:", error);
    res
      .status(500)
      .json({
        message: "Error fetching users in userRoutes",
        error: error.message,
      });
  }
});
router.get("/profile", userAuth, userController.getUserProfile);
router.put("/:id", userAuth, userController.updateUser);
router.delete("/:id", userAuth, userController.deleteUser);

module.exports = router;
