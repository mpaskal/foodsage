const mongoose = require("mongoose");

const costSavingInsightSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
  },
  description: { type: String, required: true },
  potentialSavings: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CostSavingInsight", costSavingInsightSchema);
