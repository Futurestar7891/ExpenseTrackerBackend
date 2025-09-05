const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userSchema = require("../../models/user");
const { userLoginValidation,resetPasswordValidation } = require("../../validation");

const login = async (req,res) => {
  try {
    const validatebody = userLoginValidation.safeParse(req.body);

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

    const { email, password } = validatebody.data;

    const userExist = await userSchema.findOne({ email });
    if (!userExist) {
      return res.status(400).json({
        success: false,
        fielderror: "email",
        message: "User does not exist",
      });
    }

    const verifyPassword = await bcrypt.compare(password, userExist.password);
    if (!verifyPassword) {
      return res.status(400).json({
        success: false,
        fielderror: "password",
        message: "Password is wrong",
      });
    }

    const token = jwt.sign(
      { id: userExist._id, email: userExist.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15d" }
      // { expiresIn: "1m" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    secure:false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: userExist._id,
        name: userExist.name,
        email: userExist.email,
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

const resetPassword = async (req, res) => {
  try {
    // Validate request body
    const validateBody = resetPasswordValidation.safeParse(req.body);

    if (!validateBody.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validateBody.error.issues.map((err) => ({
          errorfield: err.path[0],
          message: err.message,
        })),
      });
    }

    const { email, newPassword, confirmPassword } = validateBody.data;

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: [
          {
            errorfield: "confirmPassword",
            message: "Passwords do not match",
          },
        ],
      });
    }

    // Check if user exists with this email
    const user = await userSchema.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Validation error",
        errors: [
          {
            errorfield: "email",
            message: "User with this email does not exist",
          },
        ],
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
};

module.exports = {login,resetPassword};
