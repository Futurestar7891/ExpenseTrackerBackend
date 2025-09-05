const expenseSchema = require("../../models/expense");
const mongoose = require("mongoose");

const deleteExpense = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { id } = req.params; 
    console.log(userId,id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid expense ID" });
    }

    // Find the expense by id and user
    const deletedExpense = await expenseSchema.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!deletedExpense) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Expense not found or not authorized",
        });
    }

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = deleteExpense;
