const { createAttendance, checkout } = require("../controllers/attendance");
const express = require("express");

const router = express.Router();

router.route("/").post(createAttendance);
router.route("/checkout/").post(checkout);

module.exports = router;
