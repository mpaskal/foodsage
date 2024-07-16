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
    image: { type: String, required: false },
    consumed: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
      index: true,
    },
    status: {
      type: String,
      required: true,
      default: "Active",
      enum: ["Active", "Inactive", "Consumed", "Waste", "Donation", "Donated"],
      index: true,
    },
    statusChangeDate: { type: Date, index: true },
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
foodItemSchema.index({ status: 1, expirationDate: 1 });
foodItemSchema.index({ tenantId: 1, status: 1 });

const FoodItem = mongoose.model("FoodItem", foodItemSchema);

module.exports = FoodItem;
