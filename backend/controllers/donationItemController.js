const FoodItem = require("../models/FoodItem");
const handleError = require("../utils/handleError");

// Get all donation items with pagination
exports.getDonationItems = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const tenantId = req.user.tenantId;

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const query = {
      tenantId,
      status: { $in: ["Donation", "Donated"] },
      statusChangeDate: { $gt: thirtyDaysAgo },
    };

    const totalItems = await FoodItem.countDocuments(query);

    const donationItems = await FoodItem.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .exec();

    console.log("Fetched donation items:", donationItems);

    res.status(200).json({
      data: donationItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: Number(page),
      totalItems: totalItems,
      limit: Number(limit),
    });
  } catch (error) {
    console.error("Error fetching donation items:", error);
    res
      .status(500)
      .json({ message: "Error fetching donation items", error: error.message });
  }
};

exports.updateDonationItem = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const updates = {
      ...req.body,
      image: req.body.image || req.body.existingImage,
    };

    // If status is changed to Donated, update the status
    if (updates.status === "Donated") {
      updates.statusChangeDate = new Date();
    }

    const donationItem = await FoodItem.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId,
        status: { $in: ["Donation", "Donated"] },
      },
      updates,
      { new: true, runValidators: true }
    );

    if (!donationItem) {
      return res.status(404).json({ message: "Donation item not found" });
    }

    console.log("Updated donation item:", donationItem);

    res.status(200).json({
      message: "Donation item updated successfully",
      data: donationItem,
    });
  } catch (error) {
    console.error("Error updating donation item:", error);
    handleError(res, error, "Error updating donation item");
  }
};

exports.deleteDonationItem = async (req, res) => {
  try {
    const { _id } = req.body;
    const tenantId = req.user.tenantId;
    const donationItem = await FoodItem.findOneAndDelete({
      _id,
      tenantId,
      status: { $in: ["Donation", "Donated"] },
    });
    if (!donationItem) {
      return res.status(404).json({ message: "Donation item not found" });
    }
    console.log("Deleted donation item:", donationItem);
    res.status(200).json({
      message: "Donation item deleted successfully",
      data: donationItem,
    });
  } catch (error) {
    console.error("Error deleting donation item:", error);
    handleError(res, error, "Error deleting donation item");
  }
};

exports.markAsDonated = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { _id } = req.params;
    const updates = {
      status: "Donated",
      statusChangeDate: new Date(),
    };

    const donatedItem = await FoodItem.findOneAndUpdate(
      { _id, tenantId, status: "Donation" },
      updates,
      { new: true, runValidators: true }
    );

    if (!donatedItem) {
      return res.status(404).json({ message: "Donation item not found" });
    }

    console.log("Marked item as donated:", donatedItem);

    res.status(200).json({
      message: "Item marked as donated successfully",
      data: donatedItem,
    });
  } catch (error) {
    console.error("Error marking item as donated:", error);
    handleError(res, error, "Error marking item as donated");
  }
};
