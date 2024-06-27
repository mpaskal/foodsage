const express = require("express");
const router = express.Router();
const userAuth = require("../middlewares/userAuth");
const {
  registerFirstUser,
  registerUser,
  loginUser,
  getAllUsers,
  getUserProfile,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

router.post("/users/register", registerFirstUser);
router.post("/users/register-user", userAuth, registerUser);
router.post("/users/login", loginUser);
router.get("/users", userAuth, getAllUsers);
router.get("/users/profile", userAuth, getUserProfile);
router.put("/users/:id", userAuth, updateUser);
router.delete("/users/:id", userAuth, deleteUser);

module.exports = router;
