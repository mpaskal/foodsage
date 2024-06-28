const express = require("express");
const router = new express.Router();
const foodItemController = require("../controllers/foodItemController"); // Adjust the path as needed

router.post("/fooditems", foodItemController.createFoodItem);
router.get("/fooditems", foodItemController.getAllFoodItems);
router.get("/fooditems/:id", foodItemController.getFoodItemById);
router.patch("/fooditems/:id", foodItemController.updateFoodItem);
router.delete("/fooditems/:id", foodItemController.deleteFoodItem);

module.exports = router;
