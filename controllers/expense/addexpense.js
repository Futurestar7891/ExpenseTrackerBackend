const expenseSchema = require("../../models/expense");
const userSchema = require("../../models/user");
const mongoose = require("mongoose");
const moment = require("moment-timezone");

const addExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, amount, text } = req.body;
    const timezone=req.query.timezone;

    // Check if user exists
    const userExist = await userSchema.findById(userId);
    if (!userExist) {
      return res.status(401).json({
        success: false,
        message: "User does not exist (unauthorized access)",
      });
    }

    // Validate amount
    if (Number(amount) < 0) {
      return res.status(400).json({
        success: false,
        fielderror: "amount",
        message: "Amount cannot be negative",
      });
    }

    // Calculate start and end of day in UTC based on user's timezone
    const startOfDayUtc = moment.tz(timezone).startOf("day").utc().toDate();
    const endOfDayUtc = moment.tz(timezone).endOf("day").utc().toDate();

    // Count today's expenses for the user
    const dailyCount = await expenseSchema.countDocuments({
      user: userId,
      date: { $gte: startOfDayUtc, $lte: endOfDayUtc },
    });

    // Limit check
    if (!userExist.isSubscribed && dailyCount >= 7) {
      return res.status(403).json({
        success: false,
        message: "Daily limit reached, working premium.",
      });
    }

    // Save expense (date automatically saved in UTC)
    const newExpense = await expenseSchema.create({
      user: new mongoose.Types.ObjectId(userId),
      category: category.trim(),
      text,
      amount,
    });

    return res.status(201).json({
      success: true,
      message: "Expense added successfully",
      
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
