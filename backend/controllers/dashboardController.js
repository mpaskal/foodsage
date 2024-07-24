const foodItemController = require("./foodItemController");

exports.getDashboardData = async (req, res) => {
  try {
    // Call the getRecentActivity function from foodItemController
    await foodItemController.getRecentActivity(req, res);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({
      message: "Error fetching dashboard data",
      error: error.message,
    });
  }
};
