const express = require("express");
const router = express.Router();
const uploadMiddleware = require("../middlewares/uploadMiddleware");
const userAuth = require("../middlewares/userAuth");
const foodItemController = require("../controllers/foodItemController");

// Get all food items (Active)
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
router.post("/delete", userAuth, async (req, res) => {
  // console.log("Delete request received:", req.body);
  try {
    const result = await foodItemController.deleteFoodItem(req, res);
    //  console.log("Delete operation result:", result);
  } catch (error) {
    console.error("Error in delete route:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;
