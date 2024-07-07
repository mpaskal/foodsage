// controllers/foodItemController.js

const FoodItem = require("../models/FoodItem");
const handleError = require("../utils/handleError");

// Get all food items with pagination
exports.getFoodItems = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const tenantId = req.user.tenantId; // Extract tenantId from the authenticated user

  try {
    const totalItems = await FoodItem.countDocuments({ tenantId }); // Count total items for this tenant
    const foodItems = await FoodItem.find({ tenantId })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    res.status(200).json({
      data: foodItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: Number(page),
      totalItems: totalItems,
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
    const tenantId = req.user.tenantId;

    const newFoodItem = new FoodItem({
      ...req.body,
      image: req.body.image || null,
      tenantId,
      moveTo: req.body.moveTo || "consume",
      consumed: req.body.consumed || 0,
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
    const tenantId = req.user.tenantId;
    const updates = {
      ...req.body,
      image: req.body.image || req.body.existingImage,
    };

    const foodItem = await FoodItem.findOneAndUpdate(
      { _id: req.params.id, tenantId },
      updates,
      {
        new: true,
        runValidators: true,
      }
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
};

exports.deleteFoodItem = async (req, res) => {
  try {
    const { _id } = req.body;
    const tenantId = req.user.tenantId;
    const foodItem = await FoodItem.findOneAndDelete({ _id, tenantId });
    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found" });
    }
    res.status(204).send();
  } catch (error) {
    handleError(res, error, "Error deleting food item");
  }
};
