const express = require("express");
const router = express.Router();
const { addTransaction, getTransactions } = require("../controllers/transactionController");
const authMiddleware = require("../middleware/authMiddleware");

// Add a transaction
router.post("/", authMiddleware, addTransaction);

// Get all transactions
router.get("/", authMiddleware, getTransactions);

// Get monthly sales (income) for the last 12 months
router.get('/sales/monthly', authMiddleware, async (req, res) => {
    const Transaction = require('../models/Transaction');
    try {
        const now = new Date();
        const months = Array.from({ length: 12 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            return { year: d.getFullYear(), month: d.getMonth() };
        }).reverse();

        const sales = await Transaction.aggregate([
            { $match: { type: "income" } },
            {
                $group: {
                    _id: { year: { $year: "$dateTime" }, month: { $month: "$dateTime" } },
                    total: { $sum: "$amount" }
                }
            }
        ]);

        const salesData = months.map(({ year, month }) => {
            const found = sales.find(s => s._id.year === year && s._id.month === month + 1);
            return {
                name: new Date(year, month).toLocaleString('default', { month: 'short' }),
                total: found ? found.total : 0
            };
        });

        res.json(salesData);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch sales data" });
    }
});

module.exports = router;
