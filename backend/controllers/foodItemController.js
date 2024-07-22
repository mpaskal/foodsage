const FoodItem = require("../models/FoodItem");
const WasteRecord = require("../models/WasteRecord");
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
    const allItems = await FoodItem.countDocuments({
      tenantId,
    });
    console.log("allItems in controller foodItems", allItems);
    const allFoodItems = await FoodItem.find({
      tenantId,
    });
    const allFoodItemsLength = allFoodItems.length;
    //  console.log("food items in controller foodItems", foodItems);
    res.status(200).json({
      data: allFoodItems,
      allItems: allItems,
      allFoodItemsLength: allFoodItemsLength,
    });
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
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    //  console.log("food items in controller foodItems", foodItems);
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
  console.log("req.body", req.body);

  try {
    const tenantId = req.user.tenantId;

    const newFoodItem = new FoodItem({
      ...req.body,
      image: req.body.image || null,
      tenantId,
      status: req.body.status || "Active",
      consumed: req.body.consumed || 0,
      purchasedDate: formatDate(req.body.purchasedDate),
      expirationDate: formatDate(req.body.expirationDate),
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

    // Only update dates if they are provided
    if (req.body.purchasedDate) {
      updates.purchasedDate = new Date(req.body.purchasedDate);
    }
    if (req.body.expirationDate) {
      updates.expirationDate = new Date(req.body.expirationDate);
    }

    // Handle status changes
    if (updates.status === "Consumed") {
      updates.consumed = 100;
    } else if (updates.status === "Waste" || updates.status === "Donation") {
      updates.statusChangeDate = new Date();
    }

    const foodItem = await FoodItem.findOneAndUpdate(
      { _id: req.params.id, tenantId },
      updates,
      {
        new: true,
        runValidators: true,
        context: "query",
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
    console.error("Error updating food item:", error);
    handleError(res, error, "Error updating food item");
  }
};

// In foodItemController.js

exports.deleteFoodItem = async (req, res) => {
  const { _id } = req.body;
  const tenantId = req.user.tenantId;
  // console.log("Attempting to delete item:", { _id, tenantId });

  try {
    const result = await FoodItem.findOneAndDelete({ _id, tenantId });
    //  console.log("Delete operation result:", result);

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
