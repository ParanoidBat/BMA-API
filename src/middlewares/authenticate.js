if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const jwt = require("jsonwebtoken");
const moment = require("moment");

const authenticate = (req, res, next) => {
  const token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }

  if (token === process.env.DEVICE_API_TOKEN) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const iat = moment.unix(decoded.iat);
    const exp = moment.unix(decoded.exp);

    const expiryInterval = process.env.NODE_ENV === "production" ? 10 : 60;

    if (exp.diff(iat, "minutes") > expiryInterval) {
      throw "Expired";
    }

    return next();
  } catch (err) {
    console.error(err);
    return res.status(401).send("Invalid Token");
  }
};

module.exports = authenticate;
