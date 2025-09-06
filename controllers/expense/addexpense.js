const { success } = require("zod");
const expenseSchema = require("../../models/expense");
const userSchema = require("../../models/user");
const mongoose=require("mongoose");

// Convert UTC -> IST
const toIST = (date) => {
  const istOffset = 5.5 * 60; // 5h30m
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + istOffset * 60000);
};

const addExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, amount, text } = req.body;

    const userExist = await userSchema.findById(userId);
    if (!userExist) {
      return res.status(401).json({
        success: false,
        message: "User does not exist (unauthorized access)",
      });
    }

    if (Number(amount) < 0) {
      return res.status(400).json({
        success: false,
        fielderror: "amount",
        message: "amount cannot be negative",
      });
    }

    // Limit check in IST
    const todayIST = toIST(new Date());
    const startOfDay = new Date(todayIST);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(todayIST);
    endOfDay.setHours(23, 59, 59, 999);

    const dailyCount = await expenseSchema.countDocuments({
      user: userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!userExist.isSubscribed && dailyCount >= 7) {
      return res.status(403).json({
        success: false,
        message: "Daily limit reached, upgrade to premium.",
      });
    }

    // ✅ Save expense with IST date
    const newExpense = await expenseSchema.create({
      user: new mongoose.Types.ObjectId(userId),
      category: category.trim(),
      text,
      amount,
      date: todayIST,
    });

    return res.status(201).json({
      success: true,
      message: "Expense added successfully",
      expense: { ...newExpense.toObject(), date: todayIST },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


module.exports = addExpense;
