// controllers/updateExpense.js
const expenseSchema = require("../../models/expense");
const mongoose = require("mongoose");

const updateExpense = async (req, res) => {
  try {
    const userId = req.user.id; // logged-in user
    const { id } = req.params;
    const { category, amount, text } = req.body;

    console.log(userId, id, category, amount, text);

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid expense ID" });
    }

    // Validate amount
    if (amount === undefined || amount < 0) {
      return res
        .status(400)
        .json({
          success: false,
          fielderror: "amount",
          message: "Invalid amount",
        });
    }

    // Validate category
    if (!category) {
      return res
        .status(400)
        .json({ success: false, message: "Category is required" });
    }

    // Find the expense by id and user
    const expense = await expenseSchema.findOne({
      _id: id,
      user: userId,
    });

    if (!expense) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Expense not found or not authorized",
        });
    }

    // Update fields
    expense.category = category;
    expense.amount = amount;
    expense.text = text || "";

    await expense.save();

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      expense,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = updateExpense;
