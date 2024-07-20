const FoodItem = require("../models/FoodItem");
const handleError = require("../utils/handleError");

// Get all waste items with pagination
exports.getWasteItems = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const tenantId = req.user.tenantId;

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    // const query = {
    //   tenantId,
    //   status: "Waste",

    // };

    const totalItems = await FoodItem.countDocuments({
      tenantId,
      status: "Waste",
    });

    const wasteItems = await FoodItem.find({
      tenantId,
      status: "Waste",
      statusChangeDate: { $gt: thirtyDaysAgo },
    })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .exec();

    console.log("Fetched waste items:", wasteItems);

    res.status(200).json({
      data: wasteItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: Number(page),
      totalItems: totalItems,
      limit: Number(limit),
    });
  } catch (error) {
    console.error("Error fetching waste items:", error);
    res
      .status(500)
      .json({ message: "Error fetching waste items", error: error.message });
  }
};

exports.updateWasteItem = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const updates = {
      ...req.body,
      image: req.body.image || req.body.existingImage,
    };

    // If status is changed from Waste, handle it accordingly
    if (updates.status && updates.status !== "Waste") {
      return exports.changeWasteItemStatus(req, res);
    }

    const wasteItem = await FoodItem.findOneAndUpdate(
      { _id: req.params.id, tenantId, status: "Waste" },
      updates,
      { new: true, runValidators: true }
    );

    if (!wasteItem) {
      return res.status(404).json({ message: "Waste item not found" });
    }

    console.log("Updated waste item:", wasteItem);

    res.status(200).json({
      message: "Waste item updated successfully",
      data: wasteItem,
    });
  } catch (error) {
    console.error("Error updating waste item:", error);
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
      status: "Waste",
    });
    if (!wasteItem) {
      return res.status(404).json({ message: "Waste item not found" });
    }
    console.log("Deleted waste item:", wasteItem);
    res
      .status(200)
      .json({ message: "Waste item deleted successfully", data: wasteItem });
  } catch (error) {
    console.error("Error deleting waste item:", error);
    handleError(res, error, "Error deleting waste item");
  }
};

exports.changeWasteItemStatus = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { status } = req.body;
    const updates = {
      status,
      statusChangeDate: new Date(),
    };

    if (status === "Consumed") {
      updates.consumed = 100;
    } else if (status === "Donation") {
      updates.statusChangeDate = new Date();
    }

    const wasteItem = await FoodItem.findOneAndUpdate(
      { _id: req.params.id, tenantId, status: "Waste" },
      updates,
      { new: true, runValidators: true }
    );

    if (!wasteItem) {
      return res.status(404).json({ message: "Waste item not found" });
    }

    console.log("Changed waste item status:", wasteItem);

    res.status(200).json({
      message: `Waste item moved to ${status} successfully`,
      data: wasteItem,
    });
  } catch (error) {
    console.error("Error changing waste item status:", error);
    handleError(res, error, "Error changing waste item status");
  }
};

// Function to mark an item as waste
exports.markAsWaste = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { _id } = req.body;
    const updates = {
      status: "Waste",
      statusChangeDate: new Date(),
    };

    const wasteItem = await FoodItem.findOneAndUpdate(
      { _id, tenantId },
      updates,
      { new: true, runValidators: true }
    );

    if (!wasteItem) {
      return res.status(404).json({ message: "Food item not found" });
    }

    console.log("Marked item as waste:", wasteItem);

    res.status(200).json({
      message: "Item marked as waste successfully",
      data: wasteItem,
    });
  } catch (error) {
    console.error("Error marking item as waste:", error);
    handleError(res, error, "Error marking item as waste");
  }
};
