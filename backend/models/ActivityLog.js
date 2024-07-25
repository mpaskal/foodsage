const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  previousStatus: String,
  newStatus: String,
});

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
module.exports = ActivityLog;
