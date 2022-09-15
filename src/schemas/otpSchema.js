const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  otp: String,
  created: {
    type: String,
    default: Date.now(),
  },
  email: {
    type: String,
    unique: true,
  },
});

const OTP = mongoose.model("OTP", otpSchema);

module.exports = OTP;
