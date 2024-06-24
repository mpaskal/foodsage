const mongoose = require("mongoose");

const userActivityLogSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  activity: { type: String, required: true },
  timeStamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserActivityLog", userActivityLogSchema);
