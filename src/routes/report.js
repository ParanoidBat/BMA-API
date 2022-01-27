const { getTodayReport } = require("../controllers/report");

const express = require("express");

const router = express.Router();

router.route("/today").get(getTodayReport);

module.exports = router;
