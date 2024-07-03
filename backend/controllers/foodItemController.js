exports.updateFoodItem = async (req, res) => {
  console.log("Updating food item with ID:", req.params.id);

  uploadMiddleware(req, res, async (err) => {
    if (err) {
      console.error("Error in upload middleware:", err);
      return res
        .status(400)
        .json({ message: "Error processing request", error: err.message });
    }

    try {
      console.log("Request body after middleware:", req.body);

      // Prepare updates
      const updates = { ...req.body };

      // Handle image update
      if (req.body.image) {
        updates.image = req.body.image; // This will be the base64 string if a new image was uploaded
      } else if (req.body.existingImage) {
        updates.image = req.body.existingImage;
      }
      // If neither new image nor existingImage is provided, don't update the image field

      console.log("Updates to be applied:", updates);

      // Update the item
      const foodItem = await FoodItem.findByIdAndUpdate(
        req.params.id,
        updates,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!foodItem) {
        console.log("Food item not found with ID:", req.params.id);
        return res.status(404).json({ message: "Food item not found" });
      }

      console.log("Food item updated successfully:", foodItem);
      res.status(200).json(foodItem);
    } catch (error) {
      console.error("Error updating food item:", error);
      res
        .status(400)
        .json({ message: "Error updating food item", error: error.message });
    }
  });
};
