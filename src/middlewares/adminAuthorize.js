if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const jwt = require("jsonwebtoken");

const authorize = (req, res, next) => {
  const token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded.user_role != "Admin") {
    return res.status(403).send("Permission Denied");
  }

  return next();
};

module.exports = authorize;
