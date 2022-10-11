const Credentials = require("../schemas/credentialsSchema");
const OTP = require("../schemas/otpSchema");
const otpGenerator = require("otp-generator");

/**
 * @api {post} /password/otp/generate/ Generate OTP
 * @apiName GenerateOTP
 * @apiGroup Password Reset
 *
 * @apiBody {String} email User's email
 * @apiSuccess {Boolean} data { data: true }. Will send an OTP to the provided email.
 */
const generateOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const emailBody = `Your password reset request OTP is: ${otp}\nIt will expire in 2 minutes.`;

    const emailOptions = {
      from: "waynetech010@gmail.com",
      to: email,
      subject: "Password Reset OTP",
      text: emailBody,
    };

    await Promise.all([
      OTP.findOneAndUpdate({ email }, { otp }, { upsert: true }),
    ]);

    return res.json({
      data: true,
    });
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
};

/**
 * @api {post} /password/otp/verify/ Verify OTP
 * @apiName VerifyOTP
 * @apiGroup Password Reset
 * @apiDescription The OTP will remain valid for 2 minutes. The API will return false for an expired OTP.
 *
 * @apiBody {String} otp The OTP sent to user
 * @apiBody {String} email User's email
 * @apiSuccess {Boolean} data { data: true || false }
 */
const verifyOTP = async (req, res) => {
  const { otp, email } = req.body;
  let isCorrect = true;

  try {
    const otpObject = await OTP.findOne({ otp, email });
    if (!otpObject) throw "Invalid OTP";

    const ttl = 2 * 60 * 1000; // 2 minutes
    if (Date.now() - otpObject.created >= ttl) isCorrect = false;

    await OTP.findOneAndDelete({ email });

    return res.json({
      data: isCorrect,
    });
  } catch (error) {
    return res.json({
      error,
    });
  }
};

/**
 * @api {post} /password/reset/ Reset Password
 * @apiName ResetPassword
 * @apiGroup Password Reset
 * @apiDescription This API should be called as the 3rd step in password reset flow.
 * 1st -> Generate OTP, 2nd -> Verify OTP
 *
 * @apiBody {String} email User's email
 * @apiBody {String} password The new password
 * @apiSuccess {Boolean} data { data: true }
 */
const resetPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    await Credentials.findOneAndUpdate({ email }, { password });

    return res.json({
      data: true,
    });
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
};

module.exports = {
  generateOTP,
  verifyOTP,
  resetPassword,
};
