const db = require("../../database");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcryptjs");

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

    await db.query(
      `INSERT INTO otp(email, otp)
      VALUES($1, $2)
      ON CONFLICT email
      DO UPDATE SET otp = EXCLUDED.otp`,
      [email, otp]
    );

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

  try {
    const otpRes = await db.queryOne(
      `SELECT true AS exist
      FROM otp
      WHERE otp = $1
      AND email = $2
      AND NOW() - created >= INTERVAL '2 minutes'`,
      [otp, email]
    );

    return res.json({
      data: Boolean(otpRes),
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

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await db.queryOne(
      `UPDATE credentials
      SET password = $1
      WHERE email = $2`,
      [passwordHash, email]
    );

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
