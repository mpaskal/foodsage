const foodItemController = require("./foodItemController");

exports.getDashboardData = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const recentActivity = await foodItemController.getRecentActivityByTenant(
      tenantId,
      5
    );
    console.log("Recent Activity from backend:", recentActivity);
    res.json({ recentActivity }); // Make sure it's an object with a recentActivity property
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({
      message: "Error fetching dashboard data",
      error: error.message,
    });
  }
};
