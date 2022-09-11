const Credentials = require("../schemas/credentialsSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

/**
 * @api {post} /login Login
 * @apiName Login
 * @apiGroup Auth
 *
 * @apiSuccess {Object} data Data containing token and user
 * @apiSuccessExample {json} Success-Example:
 * {
 * token: {String},
 * user: {Object}
 * }
 */
const login = async (req, res) => {
  const { email, password, phone } = req.body;

  try {
    let query;
    if (email) {
      query = Credentials.findOne({ email }).populate("user");
    } else if (phone) {
      query = Credentials.findOne({ phone }).populate("user");
    }

    const credentials = await query;

    if (credentials && (await bcrypt.compare(password, credentials.password))) {
      const token = jwt.sign(
        { user_id: credentials.user._id, email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.json({
        data: {
          token,
          user: credentials.user,
        },
      });
    } else {
      return res.json({
        error: "Credentials don't match.",
      });
    }
  } catch (err) {
    return res.json({
      error: "Credentials don't match",
    });
  }
};

module.exports = login;
