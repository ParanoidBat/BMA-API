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

    const response = await db.query(
      `SELECT *, c.password
      FROM users, credentials c
      WHERE id = (
        SELECT user_id
        FROM credentials
        WHERE ${condition}
      )`
    );

    const credentials = response.rows[0];

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
