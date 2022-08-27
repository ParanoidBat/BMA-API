const Credentials = require("../schemas/credentialsSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const login = async (req, res) => {
  const { email, password, phone } = req.body;

  try {
    let query;
    if (email) {
      query = Credentials.findOne({ email }).populate(
        "user",
        "_id organizationID role"
      );
    } else if (phone) {
      query = Credentials.findOne({ phone }).populate(
        "user",
        "_id organizationID role"
      );
    }

    const credentials = await query;

    if (credentials && (await bcrypt.compare(password, credentials.password))) {
      const token = jwt.sign(
        { user_id: credentials.user._id, email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({
        data: {
          token,
          id: credentials.user._id,
          orgID: credentials.user.organizationID,
          role: credentials.user.role,
        },
      });
    } else {
      res.json({
        error: "Credentials don't match.",
      });
    }
  } catch (err) {
    res.json({
      error: "Credentials don't match",
    });
  }
};

module.exports = login;
