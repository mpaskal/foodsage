const express = require("express");
const router = express.Router();
const uploadMiddleware = require("../middlewares/uploadMiddleware");
const userAuth = require("../middlewares/userAuth");
const foodItemController = require("../controllers/foodItemController");

router.get("/", userAuth, foodItemController.getFoodItems);
router.post("/", userAuth, uploadMiddleware, foodItemController.createFoodItem);
router.post(
  "/update/:id",
  userAuth,
  uploadMiddleware,
  foodItemController.updateFoodItem
); // Changed to use a POST request with 'update' in the path
router.post("/delete", userAuth, foodItemController.deleteFoodItem); // Changed to use a POST request

module.exports = router;
