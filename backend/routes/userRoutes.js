const express = require("express");
const router = express.Router();
const userAuth = require("../middlewares/userAuth");
const userController = require("../controllers/userController");

router.post("/register", userController.registerFirstUser);
router.post("/register-user", userAuth, userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/", userAuth, userController.getAllUsers);
router.get("/profile", userAuth, userController.getUserProfile);
router.put("/:id", userAuth, userController.updateUser);
router.delete("/:id", userAuth, userController.deleteUser); // Ensure this is correct

module.exports = router;
