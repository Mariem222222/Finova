const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/history-recommendations
router.get("/history-recommendations", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const k = parseInt(req.query.k) || 5;

    // Placeholder for actual recommendation logic
    const recommendations = [
      "Reduce eating out",
      "Automate savings",
      "Review subscriptions",
    ];

    console.log(`Returning history-based recommendations for user ${userId}:`, recommendations);
    res.status(200).json(recommendations);
  } catch (error) {
    console.error("Error fetching history-based recommendations:", error);
    res.status(500).json({ error: "Failed to fetch history-based recommendations" });
  }
});

// POST /api/goal-recommendations
router.post("/goal-recommendations", authMiddleware, async (req, res) => {
  try {
    const goal = req.body;

    // Placeholder for actual goal-based recommendation logic
    const recommendations = [
      "Increase monthly savings by 10%",
      "Find a higher-yield savings account",
      "Reduce non-essential expenses",
    ];

    console.log("Returning goal-based recommendations:", recommendations);
    res.status(200).json(recommendations);
  } catch (error) {
    console.error("Error fetching goal-based recommendations:", error);
    res.status(500).json({ error: "Failed to fetch goal-based recommendations" });
  }
});

module.exports = router;
