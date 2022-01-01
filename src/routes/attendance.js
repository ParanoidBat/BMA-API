const { createAttendance } = require("../controllers/attendance");
const express = require("express");

const router = express.Router();

router.route("/:id").post(createAttendance);

module.exports = router;
