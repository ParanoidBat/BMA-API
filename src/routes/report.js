const {
  getTodayReport,
  getWeeklyReport,
  getMonthlyReport,
  getSixMonthsReport,
  getReportOnDate,
} = require("../controllers/report");

const express = require("express");

const router = express.Router();

router.route("/today").get(getTodayReport);
router.route("/weekly").get(getWeeklyReport);
router.route("/monthly").get(getMonthlyReport);
router.route("/six").get(getSixMonthsReport);
router.route("/on").get(getReportOnDate);

module.exports = router;
