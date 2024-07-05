const DonationItem = require("../models/DonationItem");
const uploadMiddleware = require("../middlewares/uploadMiddleware");

const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(400).json({ message, error: error.message });
};

// Get all donation items with pagination
exports.getDonationItems = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const totalItems = await DonationItem.countDocuments(); // Count total items in the collection
    const donationItems = await DonationItem.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    res.status(200).json({
      data: donationItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: Number(page),
      totalItems: totalItems, // Include the total count in the response
      limit: Number(limit),
    });
  } catch (error) {
    console.error("Error fetching donation items:", error);
    res.status(500).json({ message: "Error fetching donation items", error });
  }
};

exports.createDonationItem = async (req, res) => {
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return handleError(res, err, "Error processing request");
    }

    try {
      const newDonationItem = new DonationItem({
        ...req.body,
        image: req.file ? req.file.path : null,
      });

      await newDonationItem.save();
      res.status(201).json({
        message: "Donation item created successfully",
        data: newDonationItem,
      });
    } catch (error) {
      handleError(res, error, "Failed to create new donation item");
    }
  });
};

exports.updateDonationItem = async (req, res) => {
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return handleError(res, err, "Error processing request");
    }

    try {
      const updates = {
        ...req.body,
        image: req.file
          ? req.file.path
          : req.body.image || req.body.existingImage,
      };

      const donationItem = await DonationItem.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
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
  });
};

exports.deleteDonationItem = async (req, res) => {
  try {
    const donationItem = await DonationItem.findByIdAndDelete(req.params.id);
    if (!donationItem) {
      return res.status(404).json({ message: "Donation item not found" });
    }
    res.status(204).send(); // No content to send back
  } catch (error) {
    handleError(res, error, "Error deleting donation item");
  }
};
