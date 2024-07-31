const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ActivityLog = require("./ActivityLog"); // Import the ActivityLog model

const foodItemSchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    quantityMeasurement: { type: String, required: true },
    storage: { type: String, required: true },
    cost: { type: Number, required: true },
    source: { type: String, required: true },
    expirationDate: { type: Date, required: false },
    purchasedDate: { type: Date, required: false },
    image: { type: String, required: false, default: null },
    consumed: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      required: true,
      default: "Active",
      enum: ["Active", "Inactive", "Consumed", "Waste", "Donation", "Donated"],
    },
    statusChangeDate: { type: Date, default: Date.now },
    previousStatus: { type: String },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
foodItemSchema.index({ tenantId: 1, name: 1 });
foodItemSchema.index({ tenantId: 1, category: 1 });
foodItemSchema.index({ tenantId: 1, status: 1 });
foodItemSchema.index({ tenantId: 1, expirationDate: 1 });
foodItemSchema.index({ tenantId: 1, purchasedDate: 1 });

// Method to log activity
foodItemSchema.methods.logActivity = async function (action, updatedBy) {
  await ActivityLog.create({
    foodItemId: this._id,
    itemName: this.name,
    updatedBy: updatedBy,
    action: action,
    previousStatus: this.previousStatus,
    newStatus: this.status,
    tenantId: this.tenantId,
  });
};

// Pre-save middleware to handle status changes
foodItemSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.previousStatus = this.status;
    this.statusChangeDate = new Date();
  }
  next();
});

const FoodItem = mongoose.model("FoodItem", foodItemSchema);

module.exports = FoodItem;
