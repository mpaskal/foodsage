const FoodItem = require("../models/FoodItem");
const WasteRecord = require("../models/WasteRecord");
const handleError = require("../utils/handleError");
const {
  calculateInsights,
  generateRecommendations,
} = require("../utils/foodItemCalcUtils");

const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

exports.getFoodInsights = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { startDate, endDate } = req.query;
    const cacheKey = `insights_${tenantId}_${startDate}_${endDate}`;

    // Check cache first
    const cachedInsights = cache.get(cacheKey);
    if (cachedInsights) {
      return res.status(200).json(cachedInsights);
    }

    const [foodItems, wasteRecords] = await Promise.all([
      FoodItem.find({
        tenantId,
        updatedAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
      }),
      WasteRecord.find({
        tenantId,
        dateRecorded: { $gte: new Date(startDate), $lte: new Date(endDate) },
      }),
    ]);

    const insights = calculateInsights(
      foodItems,
      wasteRecords,
      new Date(startDate),
      new Date(endDate)
    );
    const recommendations = generateRecommendations(insights);

    const result = { insights, recommendations };
    cache.set(cacheKey, result);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getFoodInsights:", error);
    handleError(res, error, "Error generating food insights");
  }
};

exports.getWasteCost = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { startDate, endDate } = req.query;
    const cacheKey = `wasteCost_${tenantId}_${startDate}_${endDate}`;

    const cachedWasteCost = cache.get(cacheKey);
    if (cachedWasteCost) {
      return res.status(200).json({ totalWasteCost: cachedWasteCost });
    }

    const wasteRecords = await WasteRecord.find({
      tenantId,
      dateRecorded: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });

    const totalWasteCost = wasteRecords.reduce(
      (sum, record) => sum + record.wasteCost,
      0
    );

    cache.set(cacheKey, totalWasteCost);

    res.status(200).json({ totalWasteCost });
  } catch (error) {
    handleError(res, error, "Error calculating waste cost");
  }
};

exports.predictFutureWaste = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { days } = req.query;
    const cacheKey = `predictedWaste_${tenantId}_${days}`;

    const cachedPrediction = cache.get(cacheKey);
    if (cachedPrediction) {
      return res.status(200).json({ predictedWaste: cachedPrediction });
    }

    const wasteRecords = await WasteRecord.find({ tenantId });

    const averageDailyWaste =
      wasteRecords.reduce((sum, record) => sum + record.wasteCost, 0) /
      wasteRecords.length;
    const predictedWaste = averageDailyWaste * days;

    cache.set(cacheKey, predictedWaste);

    res.status(200).json({ predictedWaste });
  } catch (error) {
    handleError(res, error, "Error predicting future waste");
  }
};
