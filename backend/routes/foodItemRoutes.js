const express = require("express");
const router = express.Router();
const uploadMiddleware = require("../middlewares/uploadMiddleware");
const foodItemController = require("../controllers/foodItemController");

router.get("/", foodItemController.getFoodItems);
router.patch("/:id", uploadMiddleware, foodItemController.updateFoodItem);
router.post("/", uploadMiddleware, foodItemController.createFoodItem);
router.delete("/:id", foodItemController.deleteFoodItem);
module.exports = router;
