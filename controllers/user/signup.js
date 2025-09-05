const nodemailer = require("nodemailer");
const userSchema = require("../../models/user");
const otpSchema = require("../../models/otp");
const bcrypt=require("bcryptjs");
const { userRegistrationValidation } = require("../../validation");

const sendOtpEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.Gmail,
        pass: process.env.Password,
      },
    });

    const mailOptions = {
      from: process.env.Gmail,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "OTP sent successfully" };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, message: "Failed to send OTP" };
  }
};

// Signup route
const signup = async (req, res) => {
  try {
    const validateBody = userRegistrationValidation.safeParse(req.body);

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

    const { name, email, password, confirmpassword } = validateBody.data;

    if (password !== confirmpassword) {
      return res.status(400).json({
        success: false,
        errorfield: "confirmpassword",
        message: "Passwords do not match",
      });
    }

    const userExist = await userSchema.findOne({ email });
    if (userExist) {
      return res.status(400).json({
        success: false,
        errorfield: "email",
        message: "User already exists with this email",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Remove any previous OTPs for this email
    await otpSchema.deleteMany({ email });

    // Save OTP and temporary user data
    await otpSchema.create({ name, email, password, otp, expires: expiry });

   
    const emailResult = await sendOtpEmail(email, otp);
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Try again later.",
        additional:emailResult
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error,
    });
  }
};

const verifySignupOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log(email, otp);

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const record = await otpSchema.findOne({ email, otp });
    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (record.expires < new Date()) {
      await otpSchema.deleteMany({ email });
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }
    const hashedPassword = await bcrypt.hash(record.password, 10);

    await userSchema.create({
      name: record.name,
      email: record.email,
      password: hashedPassword,
    });

    // Remove OTP record after successful verification
    await otpSchema.deleteMany({ email });

    return res.status(200).json({
      success: true,
      message: "User verified and registered successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if the user exists
    const userExist = await userSchema.findOne({ email });
    if (!userExist) {
      return res.status(404).json({
        success: false,
        errorfield:"email",
        message: "No user found with this email",
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Remove any previous OTPs for this email
    await otpSchema.deleteMany({ email });

    // Save OTP and email only
    await otpSchema.create({ email, otp, expires: expiry });

    // Send OTP email
    const emailResult = await sendOtpEmail(email, otp);
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Try again later.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const verifyForgotOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    const record = await otpSchema.findOne({ email, otp });
    if (!record) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (record.expires < new Date()) {
      await otpSchema.deleteMany({ email });
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

 
    await otpSchema.deleteMany({ email }); 

    return res
      .status(200)
      .json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// Verify OTP route

module.exports = { signup, verifySignupOtp, forgotPassword, verifyForgotOtp };
