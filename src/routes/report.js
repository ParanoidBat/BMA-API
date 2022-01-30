const {
  getTodayReport,
  getWeeklyReport,
  getMonthlyReport,
  getThreeMonthsReport,
  getSixMonthsReport,
  getReportOnDate,
} = require("../controllers/report");

const express = require("express");

const router = express.Router();

router.route("/today").post(getTodayReport);
router.route("/weekly").post(getWeeklyReport);
router.route("/monthly").post(getMonthlyReport);
router.route("/three").post(getThreeMonthsReport);
router.route("/six").post(getSixMonthsReport);
router.route("/on").post(getReportOnDate);

module.exports = router;
