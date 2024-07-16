const FoodItem = require("../models/FoodItem");
const WasteRecord = require("../models/WasteRecord");
const handleError = require("../utils/handleError");
const {
  calculateInsights,
  generateRecommendations,
} = require("../utils/foodItemCalcUtils");

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
