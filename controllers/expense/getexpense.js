const expenseSchema = require("../../models/expense");
const userSchema = require("../../models/user");
const mongoose = require("mongoose");

const getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    let { categories, minAmount, maxAmount, startDate, endDate } = req.query;
    console.log(req.query);
    console.log(userId);

    const userExist = await userSchema.findById(userId);
    if (!userExist) {
      return res.status(401).json({
        success: false,
        message: "User does not exist (unauthorized access)",
      });
    }

   const filterQuery = { user: new mongoose.Types.ObjectId(userId) };

    // Category filter (optional)
    if (categories) {
      categories = Array.isArray(categories) ? categories : [categories];
      if(!categories.includes("All")){

            filterQuery.category = { $in: categories };
      }
      
    }

    // Amount filter
    if (minAmount != null || maxAmount != null) {
      filterQuery.amount = {};
      if (minAmount != null) filterQuery.amount.$gte = Number(minAmount);
      if (maxAmount != null) filterQuery.amount.$lte = Number(maxAmount);
    }


    // Date filter (only if at least one date is provided)

  const parseDate = (d) => {
    const [year, month, day] = d.split("-").map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  };

  let start = startDate ? parseDate(startDate) : new Date(userExist.createdAt);
  let end = endDate ? parseDate(endDate) : new Date();

  // Include the full end day
  end.setHours(23, 59, 59, 999);

  filterQuery.date = { $gte: start, $lte: end };

  console.log("Final filterQuery:", filterQuery);

    // Run filtered query
    const fetchexpenses = await expenseSchema
      .find(filterQuery)
      .sort({ date: -1 });

      console.log(fetchexpenses);

   return res.status(200).json({
     success: true,
     count: fetchexpenses.length,
     expenses: fetchexpenses,
     daterange: {
       startDate: start,
       endDate: end,
     },
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

module.exports = getExpenses;
