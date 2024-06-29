const FoodItem = require("../models/FoodItem");
const upload = require("../middlewares/upload"); // Correct path to upload.js

// Create a new food item
const FoodItem = require("../models/FoodItem");
const upload = require("../middlewares/upload");

// Create a new food item
exports.createFoodItem = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Upload Error:", err);
      return res.status(400).send({ message: err });
    }

    console.log("Received Body:", req.body); // Log received body
    console.log("Received File:", req.file); // Log received file

    try {
      const newItem = new FoodItem({
        ...req.body,
        image: req.file ? req.file.path : null,
      });
      await newItem.save();
      res.status(201).send(newItem);
    } catch (error) {
      console.error("Error creating food item:", error.message);
      res.status(400).send({ message: error.message });
    }
  });
};

// Get all food items
exports.getFoodItems = async (req, res) => {
  try {
    const foodItems = await FoodItem.find();
    res.status(200).json(foodItems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching food items", error });
  }
};

// Get a food item by ID
exports.getFoodItemById = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);
    if (!foodItem) {
      return res.status(404).send();
    }
    res.status(200).send(foodItem);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Update a food item
exports.updateFoodItem = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send({ message: err });
    }

    try {
      const updates = {
        ...req.body,
        image: req.file ? req.file.path : req.body.image, // Use the existing image if no new file is uploaded
      };
      const foodItem = await FoodItem.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );
      if (!foodItem) {
        return res.status(404).send();
      }
      res.status(200).send(foodItem);
    } catch (error) {
      res.status(400).send(error);
    }
  });
};

// Delete a food item
exports.deleteFoodItem = async (req, res) => {
  try {
    const foodItem = await FoodItem.findByIdAndDelete(req.params.id);
    if (!foodItem) {
      return res.status(404).send();
    }
    res.status(200).send(foodItem);
  } catch (error) {
    res.status(500).send(error);
  }
};
