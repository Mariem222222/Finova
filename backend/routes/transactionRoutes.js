const express = require("express");
const router = express.Router();
const { addTransaction, getTransactions } = require("../controllers/transactionController");
const authMiddleware = require("../middleware/authMiddleware");

// Add a transaction
router.post("/", authMiddleware, addTransaction);

// Get all transactions
router.get("/", authMiddleware, getTransactions);

module.exports = router;
