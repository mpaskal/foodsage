const express = require("express");
const router = express.Router();
const userAuth = require("../middlewares/userAuth");
const FoodItem = require("../models/FoodItem");
const User = require("../models/User");

router.get("/recent-activity", userAuth, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const recentActivity = await FoodItem.find({ tenantId })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate("updatedBy", "firstName lastName")
      .select("name status updatedAt updatedBy");

    const formattedActivity = recentActivity.map((item) => ({
      itemName: item.name,
      action: getActionFromStatus(item.status),
      user: item.updatedBy
        ? `${item.updatedBy.firstName} ${item.updatedBy.lastName}`
        : "Unknown User",
      date: item.updatedAt,
    }));

    res.json(formattedActivity);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({
      message: "Error fetching recent activity",
      error: error.message,
    });
  }
});

function getActionFromStatus(status) {
  switch (status) {
    case "Active":
      return "added";
    case "Consumed":
      return "consumed";
    case "Waste":
      return "wasted";
    case "Donation":
      return "marked for donation";
    case "Donated":
      return "donated";
    default:
      return "updated";
  }
}

module.exports = router;
