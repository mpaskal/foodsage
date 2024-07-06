const FoodItem = require("../models/FoodItem");
const handleError = require("../utils/handleError");

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

exports.createFoodItem = async (req, res) => {
  console.log("req.body", req.body);

  try {
    const tenantId = req.user.tenantId; // Extract tenantId from the authenticated user

    const newFoodItem = new FoodItem({
      ...req.body,
      image: req.body.image || null,
      tenantId, // Add tenantId to the new food item
      moveTo: req.body.moveTo || "consume", // Provide default value if not present
      consumed: req.body.consumed || 0, // Provide default value if not present
    });

    await newFoodItem.save();
    res.status(201).json({
      message: "Food item created successfully",
      data: newFoodItem,
    });
  } catch (error) {
    handleError(res, error, "Failed to create new food item");
  }
};

exports.updateFoodItem = async (req, res) => {
  try {
    const updates = {
      ...req.body,
      image: req.body.image || req.body.existingImage,
    };

    const foodItem = await FoodItem.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

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
