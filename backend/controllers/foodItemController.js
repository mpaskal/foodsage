const FoodItem = require("../models/FoodItem");

// Create a new food item
exports.createFoodItem = async (req, res) => {
  try {
    const foodItem = new FoodItem(req.body);
    await foodItem.save();
    res.status(201).send(foodItem);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Get all food items
exports.getAllFoodItems = async (req, res) => {
  try {
    const foodItems = await FoodItem.find({});
    res.status(200).send(foodItems);
  } catch (error) {
    res.status(500).send(error);
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
  try {
    const foodItem = await FoodItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!foodItem) {
      return res.status(404).send();
    }
    res.status(200).send(foodItem);
  } catch (error) {
    res.status(400).send(error);
  }
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
