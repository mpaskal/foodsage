const WasteItem = require("../models/WasteItem");
const uploadMiddleware = require("../middlewares/uploadMiddleware");

const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(400).json({ message, error: error.message });
};

// Get all waste items with pagination
exports.getWasteItems = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const totalItems = await WasteItem.countDocuments(); // Count total items in the collection
    const wasteItems = await WasteItem.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    res.status(200).json({
      data: wasteItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: Number(page),
      totalItems: totalItems, // Include the total count in the response
      limit: Number(limit),
    });
  } catch (error) {
    console.error("Error fetching waste items:", error);
    res.status(500).json({ message: "Error fetching waste items", error });
  }
};

exports.createWasteItem = async (req, res) => {
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return handleError(res, err, "Error processing request");
    }

    try {
      const newWasteItem = new WasteItem({
        ...req.body,
        image: req.file ? req.file.path : null,
      });

      await newWasteItem.save();
      res.status(201).json({
        message: "Waste item created successfully",
        data: newWasteItem,
      });
    } catch (error) {
      handleError(res, error, "Failed to create new waste item");
    }
  });
};

exports.updateWasteItem = async (req, res) => {
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

      const wasteItem = await WasteItem.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );

      if (!wasteItem) {
        return res.status(404).json({ message: "Waste item not found" });
      }

      res.status(200).json({
        message: "Waste item updated successfully",
        data: wasteItem,
      });
    } catch (error) {
      handleError(res, error, "Error updating waste item");
    }
  });
};

exports.deleteWasteItem = async (req, res) => {
  try {
    const wasteItem = await WasteItem.findByIdAndDelete(req.params.id);
    if (!wasteItem) {
      return res.status(404).json({ message: "Waste item not found" });
    }
    res.status(204).send(); // No content to send back
  } catch (error) {
    handleError(res, error, "Error deleting waste item");
  }
};
