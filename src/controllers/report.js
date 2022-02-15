const Attendance = require("../schemas/attendanceSchema");
const moment = require("moment");
const { remove } = require("lodash");
const Organization = require("../schemas/organizationSchema");

const getTodayReport = async (req, res) => {
  try {
    const today = moment().format("YYYY/MM/DD");

    const organization = await Organization.findById(req.params.id).populate(
      "dailyAttendance"
    );

    const removed = remove(organization.dailyAttendance, (attendance) => {
      return attendance.date != today;
    });

    if (removed.length > 0) await organization.save();

    res.json({
      data: organization.dailyAttendance,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: Couldn't generate daily report.",
    });
  }
};

const getWeeklyReport = async (req, res) => {
  try {
    const startOfWeek = moment().clone().startOf("week").format("YYYY/MM/DD");

    const attendances = await Attendance.find(
      {
        date: {
          $gte: startOfWeek,
          $lte: moment().format("YYYY/MM/DD"),
        },
        organizationID: req.params.id,
      },
      "date timeIn timeOut userName"
    );

    res.json({
      data: attendances,
    });
  } catch (err) {
    res.json({
      error: "Error: Couldn't generate weekly report.",
    });
  }
};

const getMonthlyReport = async (req, res) => {
  try {
    const startOfMonth = moment().clone().startOf("month").format("YYYY/MM/DD");

    const attendances = await Attendance.find(
      {
        date: {
          $gte: startOfMonth,
          $lte: moment().format("YYYY/MM/DD"),
        },
        organizationID: req.params.id,
      },
      "date timeIn timeOut userName"
    );

    res.json({
      data: attendances,
    });
  } catch (err) {
    res.json({
      error: "Error: Couldn't generate monthly report.",
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

    const attendances = await Attendance.find(
      {
        date: {
          $gte: last3Months,
          $lte: moment().format("YYYY/MM/DD"),
        },
        organizationID: req.params.id,
      },
      "date timeIn timeOut userName"
    );

    res.json({
      data: attendances,
    });
  } catch (err) {
    res.json({
      error: "Error: Couldn't generate 3 months report.",
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

    const attendances = await Attendance.find(
      {
        date: {
          $gte: last6Months,
          $lte: moment().format("YYYY/MM/DD"),
        },
        organizationID: req.params.id,
      },
      "date timeIn timeOut userName"
    );

    res.json({
      data: attendances,
    });
  } catch (err) {
    res.json({
      error: "Error: Couldn't generate 6 months report.",
    });
  }
};

const getUserReport = async (req, res) => {
  try {
    const attendances = await Attendance.find(
      {
        userID: req.params.userID,
        organizationID: req.params.orgID,
      },
      "date timeIn timeOut"
    ).sort({ _id: -1 });

    res.json({
      data: attendances,
    });
  } catch (err) {
    res.json({
      error: `Error: Couldn't generate report for user.`,
    });
  }
};

const getFilteredUserReport = async (req, res) => {
  try {
    var { from, to } = req.body;

    from = moment(from, "YYYY/MM/DD").format("YYYY/MM/DD");
    to = moment(to, "YYYY/MM/DD").format("YYYY/MM/DD");

    if (moment(from).isAfter(to)) [from, to] = [to, from];

    const attendances = await Attendance.find(
      {
        userID: req.params.userID,
        organizationID: req.params.orgID,
        date: {
          $lte: to,
          $gte: from,
        },
      },
      "date timeIn timeOut"
    ).sort({ _id: -1 });

    res.json({
      data: attendances,
    });
  } catch (err) {
    res.json({
      error: `Error: Couldn't generate report for user.`,
    });
  }
};

const getCustomReport = async () => {
  try {
    var { from, to } = req.body;

    from = moment(from, "YYYY/MM/DD").format("YYYY/MM/DD");
    to = moment(to, "YYYY/MM/DD").format("YYYY/MM/DD");

    if (moment(from).isAfter(to)) [from, to] = [to, from];

    const attendances = await Attendance.find(
      {
        organizationID: req.params.id,
        date: {
          $lte: to,
          $gte: from,
        },
      },
      "userName date timeIn timeOut"
    ).sort({ _id: -1 });

    res.json({
      data: attendances,
    });
  } catch (err) {
    res.json({
      error: `Error: Couldn't generate report.`,
    });
  }
};

module.exports = {
  getTodayReport,
  getWeeklyReport,
  getMonthlyReport,
  getThreeMonthsReport,
  getSixMonthsReport,
  getUserReport,
  getFilteredUserReport,
  getCustomReport,
};
