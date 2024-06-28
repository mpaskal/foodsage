const express = require("express");
const router = new express.Router();
const foodItemController = require("../controllers/foodItemController");
const upload = require("../middleware/upload");

router.post("/fooditems", upload, foodItemController.createFoodItem);
router.patch("/fooditems/:id", upload, foodItemController.updateFoodItem);

module.exports = router;
