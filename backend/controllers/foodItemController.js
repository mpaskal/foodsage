const FoodItem = require("../models/FoodItem");
const uploadMiddleware = require("../middlewares/uploadMiddleware");

// Create a new food item
exports.createFoodItem = async (req, res) => {
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      console.error("Error uploading file:", err); // Log error details
      return res.status(400).json({ message: "Error uploading file", err });
    }
    try {
      const newItem = new FoodItem({
        ...req.body,
        image: req.file ? req.file.path : null,
      });
      await newItem.save();
      res.status(201).json(newItem);
    } catch (error) {
      console.error("Error creating food item:", error); // Log error details
      res.status(400).json({ message: "Error creating food item", error });
    }
  });
};

// Get all food items with pagination
exports.getFoodItems = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const totalItems = await FoodItem.countDocuments(); // Count total items in the collection
    const foodItems = await FoodItem.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    res.status(200).json({
      data: foodItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: Number(page),
      totalItems: totalItems, // Include the total count in the response
      limit: Number(limit),
    });
  } catch (error) {
    console.error("Error fetching food items:", error);
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
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: "Error uploading file", err });
    }
    try {
      const updates = {
        ...req.body,
        image: req.body.image ? req.body.image : req.body.existingImage,
      };
      const foodItem = await FoodItem.findByIdAndUpdate(
        req.params.id,
        updates,
        {
          new: true,
          runValidators: true,
        }
      );
      if (!foodItem) {
        return res.status(404).json({ message: "Food item not found" });
      }
      res.status(200).json(foodItem);
    } catch (error) {
      res.status(400).json({ message: "Error updating food item", error });
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
