const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const foodItemSchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    quantityMeasurement: { type: String, required: true },
    storage: { type: String, required: true },
    cost: { type: Number, required: true },
    source: { type: String, required: true },
    expirationDate: { type: Date, required: true },
    purchasedDate: { type: Date, required: true },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: { type: String }, // Assuming you have an image URL or path
  },
  { timestamps: true } // This adds createdAt and updatedAt fields
);

module.exports = mongoose.model("FoodItem", foodItemSchema);
