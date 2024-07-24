const express = require("express");
const router = express.Router();
const userAuth = require("../middlewares/userAuth");
const dashboardController = require("../controllers/dashboardController");

// Change this route to use the new dashboardController
router.get("/recent-activity", userAuth, dashboardController.getDashboardData);

module.exports = router;
