const mongoose = require("mongoose");
const FoodItem = require("../models/FoodItem");
const WasteRecord = require("../models/WasteRecord");
const ActivityLog = require("../models/ActivityLog"); // Make sure you have this model
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
  console.log("Received request for getAllFoodItems");
  console.log("User:", req.user);
  console.log("TenantId:", tenantId);

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

exports.createFoodItem = async (req, res) => {
  console.log("Received food item data createFoodItem:", req.body);
  try {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;

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
    const tenantId = req.user.tenantId;
    const foodItem = await FoodItem.findOne({ _id: req.params.id, tenantId });

    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found" });
    }

    const previousStatus = foodItem.status;
    let updates = {};

    // Parse form data
    for (let [key, value] of Object.entries(req.body)) {
      if (key === "purchasedDate" || key === "expirationDate") {
        updates[key] = new Date(value);
      } else {
        try {
          updates[key] = JSON.parse(value);
        } catch {
          updates[key] = value;
        }
      }
    }

    console.log("Received file:", req.file);
    if (req.file) {
      updates.image = req.file.buffer.toString("base64");
    }

    updates.updatedBy = req.user._id;

    const updatedFields = Object.keys(updates).filter(
      (key) =>
        key !== "updatedBy" &&
        JSON.stringify(foodItem[key]) !== JSON.stringify(updates[key])
    );

    let action;
    if (updates.status && updates.status !== previousStatus) {
      action = `changed status from ${previousStatus} to ${updates.status}`;
    } else if (updatedFields.length > 0) {
      action = `updated ${updatedFields.join(", ")}`;
    } else {
      action = "updated";
    }

    const newActivity = {
      updatedBy: updates.updatedBy,
      action: action,
      timestamp: new Date(),
      previousStatus: previousStatus,
      newStatus: updates.status || foodItem.status,
    };

    updates.$push = { activityLog: newActivity };

    const updatedFoodItem = await FoodItem.findOneAndUpdate(
      { _id: req.params.id, tenantId },
      updates,
      { new: true, runValidators: true }
    ).populate("updatedBy", "firstName lastName");

    res.status(200).json({
      message: "Food item updated successfully",
      data: updatedFoodItem,
    });
  } catch (error) {
    console.error("Error updating food item:", error);
    res
      .status(500)
      .json({ message: "Error updating food item", error: error.message });
  }
};

exports.deleteFoodItem = async (req, res) => {
  try {
    const { _id } = req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user._id || req.user.id; // Use either _id or id

    console.log("Deleting food item:", { _id, tenantId, userId });
    console.log("Full user object:", req.user);

    const foodItem = await FoodItem.findOne({ _id, tenantId });

    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found" });
    }

    console.log("Food item found:", foodItem);

    const newActivity = {
      itemName: foodItem.name,
      updatedBy: new mongoose.Types.ObjectId(userId), // Ensure it's an ObjectId
      action: "deleted",
      timestamp: new Date(),
      previousStatus: foodItem.status,
      newStatus: "Deleted",
    };

    console.log("New activity to be created:", newActivity);

    // Add the deletion activity to ActivityLog
    const activityLog = await ActivityLog.create(newActivity);
    console.log("Created ActivityLog:", activityLog);

    await FoodItem.findOneAndDelete({ _id, tenantId });

    res.status(200).json({ message: "Food item deleted successfully" });
  } catch (error) {
    console.error("Error deleting food item:", error);
    if (error.name === "ValidationError") {
      console.error("Validation error details:", error.errors);
    }
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

    // Fetch deletion activities
    const deletionActivities = await ActivityLog.find({ action: "deleted" })
      .sort({ timestamp: -1 })
      .limit(10)
      .populate("updatedBy", "firstName lastName")
      .lean()
      .then((activities) =>
        activities.map((activity) => ({
          ...activity,
          user: `${activity.updatedBy.firstName} ${activity.updatedBy.lastName}`,
          date: activity.timestamp,
        }))
      );

    // Combine and sort all activities
    const allActivities = [...recentActivity, ...deletionActivities]
      .sort((a, b) => b.date - a.date)
      .slice(0, 10);

    res.json(allActivities);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({
      message: "Error fetching recent activity",
      error: error.message,
    });
  }
};
