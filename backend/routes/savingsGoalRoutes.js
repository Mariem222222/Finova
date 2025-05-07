const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const SavingsGoal = require("../models/SavingsGoal");

// Create a new savings goal
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, targetAmount, currentAmount, targetDate } = req.body;
    const userId = req.user.userId;

    const savingsGoal = new SavingsGoal({
      userId,
      name,
      targetAmount,
      currentAmount,
      targetDate,
    });

    const savedGoal = await savingsGoal.save();
    res.status(201).json(savedGoal);
  } catch (error) {
    console.error("Error creating savings goal:", error);
    res.status(500).json({ error: "Failed to create savings goal" });
  }
});

// Get all savings goals for a user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const savingsGoals = await SavingsGoal.find({ userId });
    res.status(200).json(savingsGoals);
  } catch (error) {
    console.error("Error fetching savings goals:", error);
    res.status(500).json({ error: "Failed to fetch savings goals" });
  }
});

module.exports = router;
