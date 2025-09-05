const { success } = require("zod");
const expenseSchema = require("../../models/expense");
const userSchema = require("../../models/user");
const mongoose=require("mongoose");

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
   
    if(Number(amount)<0){
         return res.status(400).json({
            success:false,
            fielderror:"amount",
            message:"amount cannot be negative"

         })
    }
  
    if (!userExist.isSubscribed) {
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59,
        999
      );

      const dailyCount = await expenseSchema.countDocuments({
        user: userId,
        date: { $gte: startOfDay, $lte: endOfDay },
      });

      if (dailyCount >= 7) {
        return res.status(403).json({
          success: false,
          message:
            "Daily limit reached we are working on premium.",
        });
      }


    }

  
    const newExpense = await expenseSchema.create({
      user: new mongoose.Types.ObjectId(userId),
      category:category.trim(),
      text,
      amount,
    });

    return res.status(201).json({
      success: true,
      message: "Expense added successfully",
      expense: newExpense,
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
