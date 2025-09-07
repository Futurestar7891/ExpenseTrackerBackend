const expenseSchema = require("../../models/expense");
const userSchema = require("../../models/user");
const mongoose = require("mongoose");
const moment = require("moment-timezone");


const getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    let { categories, minAmount, maxAmount, startDate, endDate,timezone } = req.query;

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

   const registrationDate = userExist.createdAt; 
   const todayUtc = new Date();

   console.log(startDate,"jhfjhd");

   const startUtc = startDate
     ? moment
         .tz(startDate, "YYYY/MM/DD", timezone)
         .startOf("day")
         .utc()
         .toDate()
     : registrationDate;

   const endUtc = endDate
     ? moment.tz(endDate, "YYYY/MM/DD", timezone).endOf("day").utc().toDate()
     : todayUtc;
 
     
  filterQuery.date = { $gte: startUtc, $lte: endUtc };

  const fetchedExpenses = await expenseSchema
  .find(filterQuery)
  .sort({ date: -1 });


   const localStartDate = moment(startUtc).tz(timezone).format("DD/MM/YYYY");
   const localEndDate = moment(endUtc).tz(timezone).format("DD/MM/YYYY");

   console.log(localStartDate);
   console.log(localEndDate);

   return res.status(200).json({
     success: true,
     count: fetchedExpenses.length,
     expenses: fetchedExpenses,
     daterange: { startDate: localStartDate, endDate: localEndDate },
   });

  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = getExpenses;
