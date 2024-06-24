const mongoose = require("mongoose");

const wasteRecordSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
  },
  foodItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FoodItem",
    required: true,
  },
  category: { type: String, required: true },
  reason: { type: String, required: true },
  dateRecorded: { type: Date, default: Date.now },
  wasteCost: { type: Number, required: true },
});

module.exports = mongoose.model("WasteRecord", wasteRecordSchema);
