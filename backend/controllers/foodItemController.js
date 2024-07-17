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

// Get all food items with pagination
exports.getFoodItems = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const tenantId = req.user.tenantId;

  try {
    const totalItems = await FoodItem.countDocuments({
      tenantId,
      status: { $in: ["Active", "Inactive"] },
    });
    const foodItems = await FoodItem.find({
      tenantId,
      status: { $in: ["Active", "Inactive"] },
    })
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
      purchasedDate: formatDate(req.body.purchasedDate),
      expirationDate: formatDate(req.body.expirationDate),
    };

    // Handle status changes
    if (updates.status === "Consumed") {
      updates.consumed = 100;
    } else if (updates.status === "Waste" || updates.status === "Donation") {
      updates.statusChangeDate = new Date();
    }

    // Log request body and updates
    console.log("Request body:", req.body);
    console.log("Updates:", updates);

    const foodItem = await FoodItem.findOneAndUpdate(
      { _id: req.params.id, tenantId },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    console.log("Updated foodItem:", foodItem);

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
