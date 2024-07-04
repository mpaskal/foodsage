const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const foodItemSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    quantity: { type: Number, required: true },
    quantityMeasurement: { type: String, required: true },
    storage: { type: String, required: true, index: true },
    cost: { type: Number, required: true },
    source: { type: String, required: true, index: true },
    expirationDate: { type: Date, required: true, index: true },
    purchasedDate: { type: Date, required: true, index: true },
    consumed: { type: String, required: true, index: true },
    moveTo: { type: String, required: true, index: true },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure the indexes are created by Mongoose
foodItemSchema.index({ name: 1 });
foodItemSchema.index({ category: 1 });
foodItemSchema.index({ tenantId: 1, category: 1 });

const FoodItem = mongoose.model("FoodItem", foodItemSchema);

module.exports = FoodItem;
