const { Attendance } = require("../schemas/attendanceSchema");
const moment = require("moment");

const getTodayReport = async (req, res) => {
  try {
    const attendances = await Attendance.find({
      date: moment().format("YYYY/MM/DD"),
    });

    res.json({
      data: attendances,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Error: Couldn't generate daily report.",
    });
  }
};

const getWeeklyReport = async (req, res) => {
  try {
    const startOfWeek = moment().clone().startOf("week").format("YYYY/MM/DD");

    const attendances = await Attendance.find({
      date: {
        $gte: startOfWeek,
        $lte: moment().format("YYYY/MM/DD"),
      },
    });

    res.json({
      data: attendances,
    });
  } catch (err) {
    console.log(err);
    res.json({
      error: "Error: Couldn't generate weekly report.",
    });
  }
};

const getMonthlyReport = async (req, res) => {
  try {
    const startOfMonth = moment().clone().startOf("month").format("YYYY/MM/DD");

    const attendances = await Attendance.find({
      date: {
        $gte: startOfMonth,
        $lte: moment().format("YYYY/MM/DD"),
      },
    });

    res.json({
      data: attendances,
    });
  } catch (err) {
    console.log(err);
    res.json({
      error: "Error: Couldn't generate weekly report.",
    });
  }
};

const getThreeMonthsReport = async (req, res) => {
  try {
    const last3Months = moment()
      .clone()
      .subtract(3, "months")
      .startOf("month")
      .format("YYYY/MM/DD");

    const attendances = await Attendance.find({
      date: {
        $gte: last3Months,
        $lte: moment().format("YYYY/MM/DD"),
      },
    });

    res.json({
      data: attendances,
    });
  } catch (err) {
    console.log(err);
    res.json({
      error: "Error: Couldn't generate weekly report.",
    });
  }
};

const getSixMonthsReport = async (req, res) => {
  try {
    const last6Months = moment()
      .clone()
      .subtract(6, "months")
      .startOf("month")
      .format("YYYY/MM/DD");

    const attendances = await Attendance.find({
      date: {
        $gte: last6Months,
        $lte: moment().format("YYYY/MM/DD"),
      },
    });

    res.json({
      data: attendances,
    });
  } catch (err) {
    console.log(err);
    res.json({
      error: "Error: Couldn't generate weekly report.",
    });
  }
};

const getReportOnDate = async (req, res) => {
  try {
    const onDate = moment(req.body.date, "YYYY/MM/DD").format("YYYY/MM/DD");

    const attendances = await Attendance.find({
      date: onDate,
    });

    res.json({
      data: attendances,
    });
  } catch (err) {
    console.log(err);
    res.json({
      error: "Error: Couldn't generate weekly report.",
    });
  }
};

module.exports = {
  getTodayReport,
  getWeeklyReport,
  getMonthlyReport,
  getThreeMonthsReport,
  getSixMonthsReport,
  getReportOnDate,
};