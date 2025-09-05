const express = require("express");
const {
  signup,
  verifySignupOtp,
  forgotPassword,
  verifyForgotOtp,
} = require("../controllers/user/signup");
const verifyUser = require("../middleware/verifyuser");
const {login,resetPassword} = require("../controllers/user/login");
const fetchLoginStatus = require("../middleware/fetchloginstatus");
const {changeProfileImage,changePassword,deleteAccount,logout}=require("../controllers/user/profile");


const router=express.Router();

router.post("/signup",signup);
router.post("/login",login);
router.post("/forgot-password",forgotPassword);
router.post("/verify-forgot-otp",verifyForgotOtp);
router.post("/reset-password",resetPassword)
router.post("/verify-signup-otp", verifySignupOtp);
router.get("/fetch-login-status",fetchLoginStatus);
router.post("/change-profile-image", verifyUser, changeProfileImage);
router.post("/change-password", verifyUser, changePassword);
router.delete("/delete-account", verifyUser, deleteAccount);
router.post("/logout", verifyUser, logout);


module.exports = router;