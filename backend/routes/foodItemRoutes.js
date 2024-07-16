const express = require("express");
const router = express.Router();
const uploadMiddleware = require("../middlewares/uploadMiddleware");
const userAuth = require("../middlewares/userAuth");
const foodItemController = require("../controllers/foodItemController");

// Get all food items (Consume)
router.get("/", userAuth, foodItemController.getFoodItems);

// Create a new food item
router.post("/", userAuth, uploadMiddleware, foodItemController.createFoodItem);

// Update a food item
router.post(
  "/update/:id",
  userAuth,
  uploadMiddleware,
  foodItemController.updateFoodItem
);

// Delete a food item
router.post("/delete", userAuth, foodItemController.deleteFoodItem);

module.exports = router;
