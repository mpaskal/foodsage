const mongoose = require("mongoose");

const wasteRecordSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    foodItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodItem",
      required: true,
      index: true,
    },
    category: { type: String, required: true, index: true },
    reason: {
      type: String,
      required: true,
      enum: ["Expired", "Spoiled", "Overproduction", "Quality Issues", "Other"],
    },
    dateRecorded: { type: Date, default: Date.now, index: true },
    expirationDate: { type: Date, required: true },
    purchaseDated: { type: Date, required: true },
    statusChangeDate: { type: Date, required: true },
    quantity: { type: Number, required: true },
    quantityUnit: { type: String, required: true },
    percentWasted: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    preventionSteps: [{ type: String }],
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

// Indexes
wasteRecordSchema.index({ tenantId: 1, dateRecorded: -1 });
wasteRecordSchema.index({ tenantId: 1, category: 1, dateRecorded: -1 });

// Virtual for calculating days between purchase and waste
wasteRecordSchema.virtual("daysFromPurchaseToWaste").get(function () {
  return Math.floor(
    (this.dateRecorded - this.purchaseDate) / (1000 * 60 * 60 * 24)
  );
});

// Virtual for calculating days between expiration and waste
wasteRecordSchema.virtual("daysFromExpirationToWaste").get(function () {
  return Math.floor(
    (this.dateRecorded - this.expirationDate) / (1000 * 60 * 60 * 24)
  );
});

// Method to generate waste prevention recommendations
wasteRecordSchema.methods.generatePreventionRecommendations = function () {
  const recommendations = [];

  if (this.reason === "Expired") {
    recommendations.push(
      "Implement a first-in-first-out (FIFO) inventory system."
    );
    recommendations.push(
      "Use visual cues like color-coded labels to highlight near-expiry items."
    );
  }

  if (this.reason === "Spoiled") {
    recommendations.push("Review storage conditions and temperatures.");
    recommendations.push(
      "Consider investing in better storage equipment or packaging."
    );
  }

  if (this.reason === "Overproduction") {
    recommendations.push("Improve demand forecasting and production planning.");
    recommendations.push(
      "Consider implementing a just-in-time production system."
    );
  }

  if (this.daysFromPurchaseToWaste < 7) {
    recommendations.push(
      "Review purchasing practices. Items are being wasted too quickly after purchase."
    );
  }

  if (this.daysFromExpirationToWaste > 0) {
    recommendations.push(
      "Improve inventory tracking to use items before they expire."
    );
  }

  return recommendations;
};

const WasteRecord = mongoose.model("WasteRecord", wasteRecordSchema);

module.exports = WasteRecord;
