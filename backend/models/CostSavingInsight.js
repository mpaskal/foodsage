const mongoose = require("mongoose");

const costSavingInsightSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now, index: true },

    // Savings and losses
    potentialSavings: { type: Number, required: true },
    actualSavings: { type: Number, required: true, default: 0 },
    moneyLost: { type: Number, required: true, default: 0 },

    // Item counts
    totalItems: { type: Number, required: true },
    consumedItems: { type: Number, required: true, default: 0 },
    wastedItems: { type: Number, required: true, default: 0 },
    donatedItems: { type: Number, required: true, default: 0 },

    // Percentages
    consumptionRate: { type: Number, min: 0, max: 100, default: 0 },
    wasteRate: { type: Number, min: 0, max: 100, default: 0 },
    donationRate: { type: Number, min: 0, max: 100, default: 0 },

    // Recommendations
    recommendations: [{ type: String }],

    // Time period this insight covers
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

// Indexes
costSavingInsightSchema.index({ tenantId: 1, date: -1 });
costSavingInsightSchema.index({ tenantId: 1, periodStart: 1, periodEnd: 1 });

module.exports = mongoose.model("CostSavingInsight", costSavingInsightSchema);
