const {
  generateOTP,
  verifyOTP,
  resetPassword,
} = require("../controllers/passwordController");

const express = require("express");
const router = express.Router();

router.route("/otp/generate").post(generateOTP);
router.route("/otp/verify").post(verifyOTP);
router.route("/reset").post(resetPassword);

module.exports = router;
