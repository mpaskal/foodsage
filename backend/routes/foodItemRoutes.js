const express = require("express");
const router = express.Router();
const uploadMiddleware = require("../middlewares/uploadMiddleware");
const foodItemController = require("../controllers/foodItemController");

// This should have a defined function 'addItem' being imported
router.get("/fooditems", foodItemController.getFoodItems);
router.post("/fooditems", foodItemController.createFoodItem);
router.get("/fooditems/:id", foodItemController.getFoodItemById);
router.patch("/fooditems/:id", foodItemController.updateFoodItem);
router.delete("/fooditems/:id", foodItemController.deleteFoodItem);

module.exports = router;
