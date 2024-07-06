const express = require("express");
const router = express.Router();
const uploadMiddleware = require("../middlewares/uploadMiddleware");
const userAuth = require("../middlewares/userAuth");
const foodItemController = require("../controllers/foodItemController");

router.get("/", userAuth, foodItemController.getFoodItems);
router.post("/", userAuth, uploadMiddleware, foodItemController.createFoodItem);
router.put(
  "/:id",
  userAuth,
  uploadMiddleware,
  foodItemController.updateFoodItem
);
router.delete("/:id", userAuth, foodItemController.deleteFoodItem);

module.exports = router;
