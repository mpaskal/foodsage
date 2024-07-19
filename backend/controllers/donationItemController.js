const DonationItem = require("../models/FoodItem");
const handleError = require("../utils/handleError");

// Get all donation items with pagination
exports.getDonationItems = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const tenantId = req.user.tenantId;

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const totalItems = await DonationItem.countDocuments({
      tenantId,
      status: "Donation",
      donationDate: { $gt: thirtyDaysAgo },
    });
    const donationItems = await DonationItem.find({
      tenantId,
      status: "Donation",
      donationDate: { $gt: thirtyDaysAgo },
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    res.status(200).json({
      data: donationItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: Number(page),
      totalItems: totalItems,
      limit: Number(limit),
    });
  } catch (error) {
    console.error("Error fetching donation items:", error);
    res.status(500).json({ message: "Error fetching donation items", error });
  }
};

exports.updateDonationItem = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const updates = {
      ...req.body,
      image: req.body.image || req.body.existingImage,
    };

    const donationItem = await DonationItem.findOneAndUpdate(
      { _id: req.params.id, tenantId },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!donationItem) {
      return res.status(404).json({ message: "Donation item not found" });
    }

    res.status(200).json({
      message: "Donation item updated successfully",
      data: donationItem,
    });
  } catch (error) {
    handleError(res, error, "Error updating donation item");
  }
};

exports.deleteDonationItem = async (req, res) => {
  try {
    const { _id } = req.body;
    const tenantId = req.user.tenantId;
    const donationItem = await DonationItem.findOneAndDelete({ _id, tenantId });
    if (!donationItem) {
      return res.status(404).json({ message: "Donation item not found" });
    }
    res.status(204).send();
  } catch (error) {
    handleError(res, error, "Error deleting donation item");
  }
};
