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

router.route("/today/:id").get(getTodayReport);
router.route("/weekly/:id").get(getWeeklyReport);
router.route("/monthly/:id").get(getMonthlyReport);
router.route("/three/:id").get(getThreeMonthsReport);
router.route("/six/:id").get(getSixMonthsReport);
router.route("/on/:id").get(getReportOnDate);

module.exports = router;
