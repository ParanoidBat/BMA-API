if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../database");

/**
 * @api {post} /login Login
 * @apiName Login
 * @apiGroup Auth
 *
 * @apiDescription Requires either email or phone
 *
 * @apiBody {String} [email]
 * @apiBody {String} [phone]
 * @apiBody {String} password
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
    let condition;
    if (email) {
      condition = `email = '${email}'`;
    } else if (phone) {
      condition = `phone = '${phone}'`;
    }

    const response = await db.queryOne(
      `WITH password AS (
        SELECT password, user_id
        FROM credentials
        WHERE ${condition}
      )
      SELECT u.*, p.password
      FROM users u, password p
      WHERE u.id = p.user_id`
    );

    const credentials = response;

    if (credentials && (await bcrypt.compare(password, credentials.password))) {
      const token = jwt.sign(
        { user_id: credentials.id, email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      delete credentials.password;

      return res.json({
        data: {
          token,
          user: credentials,
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
