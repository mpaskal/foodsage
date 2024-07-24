const mongoose = require("mongoose");
const FoodItem = require("../models/FoodItem");
const WasteRecord = require("../models/WasteRecord");
const { getActionFromStatus } = require("../utils/statusUtils");
const handleError = require("../utils/handleError");
const {
  calculateInsights,
  generateRecommendations,
} = require("../utils/foodItemCalcUtils");
const { parseISO, format } = require("date-fns");

const formatDate = (dateString) => {
  if (!dateString) return null;
  try {
    return format(parseISO(dateString), "yyyy-MM-dd");
  } catch {
    return null;
  }
};

// Get all food items
exports.getAllFoodItems = async (req, res) => {
  const tenantId = req.user.tenantId;

  try {
    const allItems = await FoodItem.countDocuments({ tenantId });
    const allFoodItems = await FoodItem.find({ tenantId }).populate(
      "updatedBy",
      "firstName lastName"
    );

    res.status(200).json({
      data: allFoodItems,
      allItems: allItems,
      allFoodItemsLength: allFoodItems.length,
    });
    console.log("allItems in controller foodItems", allItems);
  } catch (error) {
    console.error("Error fetching food items:", error);
    res.status(500).json({ message: "Error fetching food items", error });
  }
};

// Get all food items with pagination
exports.getFoodItems = async (req, res) => {
  console.log("food items in controller req.query", req.query);
  const { page = 1, limit = 10 } = req.query;
  const tenantId = req.user.tenantId;

  try {
    const totalItems = await FoodItem.countDocuments({
      tenantId,
      status: { $in: ["Active", "Inactive"] },
    });
    console.log("totalItems in controller foodItems", totalItems);
    const foodItems = await FoodItem.find({
      tenantId,
      status: { $in: ["Active", "Inactive"] },
    })
      .populate("updatedBy", "firstName lastName")
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
    console.log("how many pages", Math.ceil(totalItems / limit));
  } catch (error) {
    console.error("Error fetching food items:", error);
    res.status(500).json({ message: "Error fetching food items", error });
  }
};

// In foodItemController.js

exports.createFoodItem = async (req, res) => {
  console.log("Received food item data createFoodItem:", req);
  try {
    const tenantId = req.user.tenantId;
    const userId = req.user.id; // Make sure this is set correctly in your auth middleware

    const newFoodItem = new FoodItem({
      ...req.body,
      image: req.body.image || null,
      tenantId,
      updatedBy: userId,
      status: req.body.status || "Active",
      consumed: req.body.consumed || 0,
      purchasedDate: formatDate(req.body.purchasedDate),
      expirationDate: formatDate(req.body.expirationDate),
      activityLog: [
        {
          updatedBy: userId,
          action: "added",
          timestamp: new Date(),
          newStatus: req.body.status || "Active",
        },
      ],
    });

    await newFoodItem.save();

    // Populate the updatedBy field after saving
    await newFoodItem.populate("updatedBy", "firstName lastName");

    res.status(201).json({
      message: "Food item created successfully",
      data: newFoodItem,
    });
  } catch (error) {
    console.error("Error in createFoodItem:", error);
    handleError(res, error, "Failed to create new food item");
  }
};

exports.updateFoodItem = async (req, res) => {
  try {
    console.log("Received update data:", req.body);

    const tenantId = req.user.tenantId;
    const foodItem = await FoodItem.findOne({ _id: req.params.id, tenantId });

    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found" });
    }

    const previousStatus = foodItem.status;
    const updates = {
      ...req.body,
      updatedBy: req.body.updatedBy || req.user._id,
      previousStatus: previousStatus,
    };

    // Create a new activity log entry
    const newActivity = {
      updatedBy: updates.updatedBy,
      action: getActionFromStatus(updates.status, previousStatus, false),
      timestamp: new Date(),
      previousStatus: previousStatus,
      newStatus: updates.status,
    };

    // Add the new activity to the updates
    updates.$push = { activityLog: newActivity };

    console.log("Updates to be applied:", updates);

    const updatedFoodItem = await FoodItem.findOneAndUpdate(
      { _id: req.params.id, tenantId },
      updates,
      { new: true, runValidators: true }
    ).populate("updatedBy", "firstName lastName");

    console.log("Updated food item:", updatedFoodItem);

    res.status(200).json({
      message: "Food item updated successfully",
      data: updatedFoodItem,
    });
  } catch (error) {
    console.error("Error updating food item:", error);
    handleError(res, error, "Error updating food item");
  }
};

exports.deleteFoodItem = async (req, res) => {
  const { _id } = req.body;
  const tenantId = req.user.tenantId;

  try {
    const result = await FoodItem.findOneAndDelete({ _id, tenantId });

    if (result) {
      res
        .status(200)
        .json({ message: "Food item deleted successfully", data: result });
    } else {
      res.status(404).json({ message: "Food item not found" });
    }
  } catch (error) {
    console.error("Error deleting food item:", error);
    res
      .status(500)
      .json({ message: "Error deleting food item", error: error.message });
  }
};

// Add these new functions for insights
exports.getFoodInsights = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { startDate, endDate } = req.query;

    const foodItems = await FoodItem.find({
      tenantId,
      updatedAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });

    const wasteRecords = await WasteRecord.find({
      tenantId,
      dateRecorded: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });

    const insights = calculateInsights(
      foodItems,
      wasteRecords,
      new Date(startDate),
      new Date(endDate)
    );
    const recommendations = generateRecommendations(insights);

    res.status(200).json({ insights, recommendations });
  } catch (error) {
    handleError(res, error, "Error generating food insights");
  }
};

exports.getWasteCost = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { startDate, endDate } = req.query;

    const wasteRecords = await WasteRecord.find({
      tenantId,
      dateRecorded: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });

    const totalWasteCost = wasteRecords.reduce(
      (sum, record) => sum + record.wasteCost,
      0
    );

    res.status(200).json({ totalWasteCost });
  } catch (error) {
    handleError(res, error, "Error calculating waste cost");
  }
};

exports.predictFutureWaste = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { days } = req.query;

    const wasteRecords = await WasteRecord.find({ tenantId });

    const averageDailyWaste =
      wasteRecords.reduce((sum, record) => sum + record.wasteCost, 0) /
      wasteRecords.length;
    const predictedWaste = averageDailyWaste * days;

    res.status(200).json({ predictedWaste });
  } catch (error) {
    handleError(res, error, "Error predicting future waste");
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const recentActivity = await FoodItem.aggregate([
      { $match: { tenantId: new mongoose.Types.ObjectId(tenantId) } },
      { $unwind: "$activityLog" },
      { $sort: { "activityLog.timestamp": -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "activityLog.updatedBy",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          itemName: "$name",
          action: "$activityLog.action",
          user: { $concat: ["$user.firstName", " ", "$user.lastName"] },
          date: "$activityLog.timestamp",
        },
      },
    ]);

    res.json(recentActivity);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({
      message: "Error fetching recent activity",
      error: error.message,
    });
  }
};
