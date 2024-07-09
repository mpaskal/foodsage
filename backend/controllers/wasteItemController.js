const WasteItem = require("../models/FoodItem");
const handleError = require("../utils/handleError");

// Get all waste items with pagination
exports.getWasteItems = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const tenantId = req.user.tenantId; // Extract tenantId from the authenticated user

  try {
    const totalItems = await WasteItem.countDocuments({ tenantId }); // Count total items for this tenant
    const wasteItems = await WasteItem.find({ tenantId })
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

exports.createWasteItem = async (req, res) => {
  console.log("req.body", req.body);

  try {
    const tenantId = req.user.tenantId;

    const newWasteItem = new WasteItem({
      ...req.body,
      image: req.body.image || null,
      tenantId,
      moveTo: req.body.moveTo || "consume",
      consumed: req.body.consumed || 0,
    });

    await newWasteItem.save();
    res.status(201).json({
      message: "Waste item created successfully",
      data: newWasteItem,
    });
  } catch (error) {
    handleError(res, error, "Failed to create new waste item");
  }
};

exports.updateWasteItem = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const updates = {
      ...req.body,
      image: req.body.image || req.body.existingImage,
    };

    const wasteItem = await WasteItem.findOneAndUpdate(
      { _id: req.params.id, tenantId },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!wasteItem) {
      return res.status(404).json({ message: "Waste item not found" });
    }

    res.status(200).json({
      message: "Waste item updated successfully",
      data: wasteItem,
    });
  } catch (error) {
    handleError(res, error, "Error updating food item");
  }
};

exports.deleteWasteItem = async (req, res) => {
  try {
    const { _id } = req.body;
    const tenantId = req.user.tenantId;
    const wasteItem = await WasteItem.findOneAndDelete({ _id, tenantId });
    if (!wasteItem) {
      return res.status(404).json({ message: "Waste item not found" });
    }
    res.status(204).send();
  } catch (error) {
    handleError(res, error, "Error deleting waste item");
  }
};
