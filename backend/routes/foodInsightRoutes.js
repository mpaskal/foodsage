const express = require("express");
const router = express.Router();
const userAuth = require("../middlewares/userAuth");
const foodInsightController = require("../controllers/foodInsightController");

// Get food insights
router.get("/", userAuth, foodInsightController.getFoodInsights);

// Get waste cost
router.get("/wastecost", userAuth, foodInsightController.getWasteCost);

// Predict future waste
router.get("/predictwaste", userAuth, foodInsightController.predictFutureWaste);

module.exports = router;
