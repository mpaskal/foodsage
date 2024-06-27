const express = require("express");
const router = express.Router();
const userAuth = require("../middlewares/userAuth");
const userController = require("../controllers/userController");

router.post("/users/register", userController.registerFirstUser);
router.post("/users/register-user", userAuth, userController.registerUser);
router.post("/users/login", userController.loginUser);
router.get("/users", userAuth, userController.getAllUsers);
router.get("/users/profile", userAuth, userController.getUserProfile);
router.put("/users/:id", userAuth, userController.updateUser);
router.delete("/users/:id", userAuth, userController.deleteUser); // Ensure this is correct

module.exports = router;
