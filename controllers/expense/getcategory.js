const userSchema=require("../../models/user")

const getCategories = async (req, res) => {
  try {
    const userId = req.user.id; 

    const userExist = await userSchema.findById(userId).select("categories")

    return res.status(200).json({
      success: true,
      count: userExist.categories.length,
      categories:userExist.categories,
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

module.exports = getCategories;
