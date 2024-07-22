// controllers/donationInsightController.js

const DonationItem = require("../models/FoodItem");
const handleError = require("../utils/handleError");

exports.getDonationInsights = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const donationItems = await DonationItem.find({ tenantId });

    const totalDonations = donationItems.length;
    const donatedItems = donationItems.filter(
      (item) => item.status === "Donated"
    ).length;
    const pendingDonations = totalDonations - donatedItems;
    const donationRate = (donatedItems / totalDonations) * 100 || 0;

    res.status(200).json({
      totalDonations,
      donatedItems,
      pendingDonations,
      donationRate,
    });
  } catch (error) {
    handleError(res, error, "Error generating donation insights");
  }
};
