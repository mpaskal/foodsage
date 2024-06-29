const express = require("express");
const router = express.Router();
const foodItemController = require("../controllers/foodItemController");

router.post("/fooditems", foodItemController.createFoodItem);
router.get("/fooditems", foodItemController.getFoodItems);
router.get("/fooditems/:id", foodItemController.getFoodItemById);
router.patch("/fooditems/:id", foodItemController.updateFoodItem);
router.delete("/fooditems/:id", foodItemController.deleteFoodItem);

module.exports = router;
