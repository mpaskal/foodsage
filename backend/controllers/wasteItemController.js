const FoodItem = require("../models/FoodItem");
const handleError = require("../utils/handleError");

// Get all waste items with pagination
exports.getWasteItems = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const tenantId = req.user.tenantId;

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const totalItems = await FoodItem.countDocuments({
      tenantId,
      moveTo: "Waste",
      wasteDate: { $gt: thirtyDaysAgo },
    });
    const wasteItems = await FoodItem.find({
      tenantId,
      moveTo: "Waste",
      wasteDate: { $gt: thirtyDaysAgo },
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

exports.updateWasteItem = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const updates = {
      ...req.body,
      image: req.body.image || req.body.existingImage,
    };

    const wasteItem = await FoodItem.findOneAndUpdate(
      { _id: req.params.id, tenantId, moveTo: "Waste" },
      updates,
      { new: true, runValidators: true }
    );

    if (!wasteItem) {
      return res.status(404).json({ message: "Waste item not found" });
    }

    res.status(200).json({
      message: "Waste item updated successfully",
      data: wasteItem,
    });
  } catch (error) {
    handleError(res, error, "Error updating waste item");
  }
};

exports.deleteWasteItem = async (req, res) => {
  try {
    const { _id } = req.body;
    const tenantId = req.user.tenantId;
    const wasteItem = await FoodItem.findOneAndDelete({
      _id,
      tenantId,
      moveTo: "Waste",
    });
    if (!wasteItem) {
      return res.status(404).json({ message: "Waste item not found" });
    }
    res.status(204).send();
  } catch (error) {
    handleError(res, error, "Error deleting waste item");
  }
};

exports.moveToConsume = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const wasteItem = await FoodItem.findOneAndUpdate(
      { _id: req.params.id, tenantId, moveTo: "Waste" },
      { moveTo: "Consume", wasteDate: null },
      { new: true, runValidators: true }
    );

    if (!wasteItem) {
      return res.status(404).json({ message: "Waste item not found" });
    }

    res.status(200).json({
      message: "Waste item moved to Consume successfully",
      data: wasteItem,
    });
  } catch (error) {
    handleError(res, error, "Error moving waste item to Consume");
  }
};
