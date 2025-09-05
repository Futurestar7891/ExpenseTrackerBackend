const User=require("../../models/user");
const Expense=require("../../models/expense");
const bcrypt=require("bcryptjs");
const { changePasswordValidation } = require("../../validation");


const changeProfileImage = async (req, res) => {
  try {
    console.log("changing image");
    const userId = req.user.id;
    console.log(userId);
    if (!userId) return res.json({ success: false, message: "Unauthorized" });
    console.log("autorized");
    if (!req.files || !req.files.photo)
      return res.json({ success: false, message: "No image uploaded" });

    const photo = req.files.photo;
    const imgBuffer = photo.data;
    const mimeType = photo.mimetype;

    const user = await User.findByIdAndUpdate(
      userId,
      { photo: { data: imgBuffer, contentType: mimeType } },
      { new: true }
    ).select("name email photo");

   
    let photoBase64 = null;
    if (user.photo?.data) {
      photoBase64 = `data:${
        user.photo.contentType
      };base64,${user.photo.data.toString("base64")}`;
    }

    
    res.json({
      success: true,
      photo: photoBase64,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Failed to upload image" });
  }
};


 const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
     const validatebody = changePasswordValidation.safeParse(req.body);
  

     if (!validatebody.success) {
       return res.status(400).json({
         success: false,
         message: "Validation error",
         errors: validatebody.error.issues.map((err) => ({
           errorfield: err.path[0],
           message: err.message,
         })),
       });
     }
    

       const { currentPassword, newPassword } = validatebody.data;


    const user = await User.findById(userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.json({
        success: false,
        fielderror:"currentPassword",
        message: "Current password is incorrect",
      });

    if (currentPassword === newPassword)
      return res.json({
        success: false,
        fielderror:"newPassword",
        message: "New password cannot be same as current",
      });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Failed to change password" });
  }
};


const deleteAccount = async (req, res) => {
  try {
    
    const userId = req.user.id;
    if (!userId) return res.json({ success: false, message: "Unauthorized" });


    await Expense.deleteMany({ user: userId });

 
    await User.findByIdAndDelete(userId);

    // Clear token cookie
    res.clearCookie("token", { httpOnly: true, sameSite: "strict" });

    res.json({
      success: true,
      message: "Account and all expenses deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Failed to delete account" });
  }
};


 const logout = async (req, res) => {
  try {
    res.clearCookie("token", { httpOnly: true, sameSite: "strict" });
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Failed to logout" });
  }
};

module.exports={changeProfileImage,changePassword,deleteAccount,logout}
