const Credentials = require("../schemas/credentialsSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const credentials = await Credentials.findOne({ email }).populate("user");

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
        },
      });
    }

    throw "Credentials don't match";
  } catch (err) {
    res.status(500).json({
      error: "Credentials don't match",
    });
  }
};

module.exports = login;
