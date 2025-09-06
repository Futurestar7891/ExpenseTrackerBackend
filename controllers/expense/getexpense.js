const expenseSchema = require("../../models/expense");
const userSchema = require("../../models/user");
const mongoose = require("mongoose");

// UTC -> IST
const toIST = (date) => {
  const istOffset = 5.5 * 60;
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + istOffset * 60000);
};

// Parse dd-mm-yyyy -> IST start/end of day
const parseDateToISTRange = (d, isEnd = false) => {
  const [year, month, day] = d.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const istDate = toIST(date);
  istDate.setHours(
    isEnd ? 23 : 0,
    isEnd ? 59 : 0,
    isEnd ? 59 : 0,
    isEnd ? 999 : 0
  );
  return istDate;
};

const getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    let { categories, minAmount, maxAmount, startDate, endDate } = req.query;

    const userExist = await userSchema.findById(userId);
    if (!userExist) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exist" });
    }

    const filterQuery = { user: new mongoose.Types.ObjectId(userId) };

    // Categories
    if (categories) {
      categories = Array.isArray(categories) ? categories : [categories];
      if (!categories.includes("All"))
        filterQuery.category = { $in: categories };
    }

    // Amount
    if (minAmount != null || maxAmount != null) {
      filterQuery.amount = {};
      if (minAmount != null) filterQuery.amount.$gte = Number(minAmount);
      if (maxAmount != null) filterQuery.amount.$lte = Number(maxAmount);
    }

    // Dates
    const start = startDate
      ? parseDateToISTRange(startDate)
      : toIST(new Date(userExist.createdAt));
    const end = endDate
      ? parseDateToISTRange(endDate, true)
      : toIST(new Date());

    filterQuery.date = { $gte: start, $lte: end };

    const fetchexpenses = await expenseSchema
      .find(filterQuery)
      .sort({ date: -1 });

    const expensesInIST = fetchexpenses.map((exp) => {
      const obj = exp.toObject();
      obj.date = toIST(new Date(obj.date));
      return obj;
    });

    return res.status(200).json({
      success: true,
      count: expensesInIST.length,
      expenses: expensesInIST,
      daterange: { startDate: start, endDate: end },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = getExpenses;
