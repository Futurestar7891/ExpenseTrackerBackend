const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true, // ensure one OTP per email at a time
  },
  password: {
    type: String,

  },
  otp: {
    type: String,
    required: true,
  },
  expires: {
    type: Date,
    default: () => Date.now() + 10 * 60 * 1000, // 10 minutes from creation
  },
});

// Optional: auto-delete expired OTPs
otpSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

// Create model
const Otp = mongoose.model("Otp", otpSchema);

module.exports = Otp;
