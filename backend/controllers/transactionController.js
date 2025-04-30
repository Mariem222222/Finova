const Transaction = require("../models/Transaction");

const addTransaction = async (req, res) => {
  try {
    const { description, amount, type, category, dateTime } = req.body;

    if (!req.user || !req.user.userId) {
      console.error("User ID is missing in the request.");
      return res.status(401).json({ error: "Unauthorized: User not authenticated" });
    }

    console.log("Adding transaction for user ID:", req.user.userId); // Debug log

    const transaction = new Transaction({
      description,
      amount,
      type,
      category,
      dateTime,
      userId: req.user.userId, // Use the userId from the token
    });

    await transaction.save();
    res.status(201).json({ message: "Transaction added successfully", transaction });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ error: "Failed to add transaction", details: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      console.error("User ID is missing in the request.");
      return res.status(401).json({ error: "Unauthorized: User not authenticated" });
    }

    console.log("Fetching transactions for user ID:", req.user.userId); // Debug log

    const transactions = await Transaction.find({ userId: req.user.userId }); // Use userId from req.user
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Failed to fetch transactions", details: error.message });
  }
};

module.exports = { addTransaction, getTransactions };
