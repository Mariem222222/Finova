const mongoose = require("mongoose");

const savingsGoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  targetDate: { type: Date, required: true },
  notified30Days: { type: Boolean, default: false },
  closedNotified: { type: Boolean, default: false },
});

module.exports = mongoose.model("SavingsGoal", savingsGoalSchema);
