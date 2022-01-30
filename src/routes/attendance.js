const { checkin, checkout } = require("../controllers/attendance");
const express = require("express");

const router = express.Router();

router.route("/").post(checkin);
router.route("/checkout").post(checkout);

module.exports = router;
