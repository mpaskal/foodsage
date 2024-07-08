// controllers/wasteItemController.js

const FoodItem = require("../models/FoodItem");
const handleError = require("../utils/handleError");

// Get all waste items with pagination
exports.getWasteItems = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const tenantId = req.user.tenantId; // Extract tenantId from the authenticated user

  try {
    const totalItems = await FoodItem.countDocuments({
      tenantId,
      moveTo: "Waste",
      purchasedDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    }); // Count total waste items for this tenant within the last 30 days

    const wasteItems = await FoodItem.find({
      tenantId,
      moveTo: "Waste",
      purchasedDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    res.status(200).json({
      data: wasteItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: Number(page),
      totalItems: totalItems,
      limit: Number(limit),
    });
  } catch (error) {
    console.error("Error fetching waste items:", error);
    res.status(500).json({ message: "Error fetching waste items", error });
  }
};

exports.moveWasteItem = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { _id } = req.params;
    const { moveTo } = req.body;

    const updatedItem = await FoodItem.findOneAndUpdate(
      { _id, tenantId },
      { moveTo },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Waste item not found" });
    }

    res.status(200).json({
      message: "Waste item moved successfully",
      data: updatedItem,
    });
  } catch (error) {
    handleError(res, error, "Error moving waste item");
  }
};

exports.deleteWasteItem = async (req, res) => {
  try {
    const { _id } = req.body;
    const tenantId = req.user.tenantId;
    const foodItem = await FoodItem.findOneAndDelete({ _id, tenantId });
    if (!wasteItem) {
      return res.status(404).json({ message: "Waste item not found" });
    }
    res.status(204).send();
  } catch (error) {
    handleError(res, error, "Error deleting waste item");
  }
};
