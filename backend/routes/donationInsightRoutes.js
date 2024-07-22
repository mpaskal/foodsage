// routes/donationInsightRoutes.js

const express = require("express");
const router = express.Router();
const userAuth = require("../middlewares/userAuth");
const donationInsightController = require("../controllers/donationInsightController");

router.get("/", userAuth, donationInsightController.getDonationInsights);

module.exports = router;
