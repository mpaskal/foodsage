// foodItemController.js

const FoodItem = require("../models/FoodItem");
const uploadMiddleware = require("../middlewares/uploadMiddleware");

const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(400).json({ message, error: error.message });
};

exports.getFoodItems = async (req, res) => {
  try {
    const foodItems = await FoodItem.find();
    res.status(200).json(foodItems);
  } catch (error) {
    handleError(res, error, "Error fetching food items");
  }
};

exports.getFoodItemById = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);
    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found" });
    }
    res.status(200).json(foodItem);
  } catch (error) {
    handleError(res, error, "Error fetching food item");
  }
};

exports.createFoodItem = async (req, res) => {
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return handleError(res, err, "Error processing request");
    }

    try {
      const newFoodItem = new FoodItem({
        ...req.body,
        image: req.file ? req.file.path : null,
      });

      await newFoodItem.save();
      res.status(201).json({
        message: "Food item created successfully",
        data: newFoodItem,
      });
    } catch (error) {
      handleError(res, error, "Failed to create new food item");
    }
  });
};

exports.updateFoodItem = async (req, res) => {
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return handleError(res, err, "Error processing request");
    }

    try {
      const updates = {
        ...req.body,
        image: req.file
          ? req.file.path
          : req.body.image || req.body.existingImage,
      };

      const foodItem = await FoodItem.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );

      if (!foodItem) {
        return res.status(404).json({ message: "Food item not found" });
      }

      res.status(200).json({
        message: "Food item updated successfully",
        data: foodItem,
      });
    } catch (error) {
      handleError(res, error, "Error updating food item");
    }
  });
};

exports.deleteFoodItem = async (req, res) => {
  try {
    const foodItem = await FoodItem.findByIdAndDelete(req.params.id);
    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found" });
    }
    res.status(204).send(); // No content to send back
  } catch (error) {
    handleError(res, error, "Error deleting food item");
  }
};
