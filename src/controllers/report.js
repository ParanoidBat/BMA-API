const Attendance = require("../schemas/attendanceSchema");
const moment = require("moment");
const { remove } = require("lodash");
const Organization = require("../schemas/organizationSchema");

const getTodayReport = async (req, res) => {
  try {
    const today = moment().format("YYYY-MM-DD");

    const organization = await Organization.findById(req.params.id).populate(
      "dailyAttendance"
    );

    const removed = remove(organization.dailyAttendance, (attendance) => {
      return attendance.date != today;
    });

    if (removed.length > 0) await organization.save();

    const percentageAttendance =
      (organization.dailyAttendance.length / organization.users.length) * 100;

    res.json({
      data: organization.dailyAttendance,
      percentageAttendance,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: Couldn't generate daily report.",
    });
  }
};

const getWeeklyReport = async (req, res) => {
  try {
    const startOfWeek = moment().clone().startOf("week").format("YYYY-MM-DD");
    const today = moment().format("YYYY-MM-DD");

    const attendances = await Attendance.find(
      {
        date: {
          $gt: startOfWeek,
          $lte: today,
        },
        organizationID: req.params.id,
      },
      "date timeIn timeOut userName"
    ).populate("organizationID", "users");

    const diff = moment(today).diff(startOfWeek, "days") + 1;
    const percentageAttendance = Math.floor(
      (attendances.length * 100) /
        (attendances[0].organizationID.users.length * diff)
    );

    res.json({
      data: attendances,
      percentageAttendance,
    });
  } catch (err) {
    res.json({
      error: "Error: Couldn't generate weekly report.",
    });
  }
};

const getMonthlyReport = async (req, res) => {
  try {
    var startOfMonth = moment().clone().startOf("month").format("YYYY-MM-DD");
    var today = moment().format("YYYY-MM-DD");

    const attendances = await Attendance.find(
      {
        date: {
          $gte: startOfMonth,
          $lte: today,
        },
        organizationID: req.params.id,
      },
      "date timeIn timeOut userName"
    ).populate("organizationID", "users");

    const diff = moment(today).diff(startOfMonth, "days") + 1;

    today = moment().format("YYYY-MM-ddd");
    startOfMonth = moment(startOfMonth, "YYYY-MM-DD").format("YYYY-MM-ddd");

    var workDays = diff - Math.floor(diff / 7);
    if (today.includes("Sun") || startOfMonth.includes("Sun")) workDays -= 1;

    const percentageAttendance = Math.floor(
      (attendances.length * 100) /
        (workDays * attendances[0].organizationID.users.length)
    );

    res.json({
      data: attendances,
      percentageAttendance,
    });
  } catch (err) {
    res.json({
      error: "Error: Couldn't generate monthly report.",
    });
  }
};

const getThreeMonthsReport = async (req, res) => {
  try {
    var last3Months = moment()
      .clone()
      .subtract(3, "months")
      .startOf("month")
      .format("YYYY-MM-DD");

    var today = moment().format("YYYY-MM-DD");

    const attendances = await Attendance.find(
      {
        date: {
          $gte: last3Months,
          $lte: today,
        },
        organizationID: req.params.id,
      },
      "date timeIn timeOut userName"
    ).populate("organizationID", "users");

    const diff = moment(today).diff(last3Months, "days") + 1;

    today = moment().format("YYYY-MM-ddd");
    last3Months = moment(last3Months, "YYYY-MM-DD").format("YYYY-MM-ddd");

    var workDays = diff - Math.floor(diff / 7);
    if (today.includes("Sun") || last3Months.includes("Sun")) workDays -= 1;

    const percentageAttendance = Math.floor(
      (attendances.length * 100) /
        (workDays * attendances[0].organizationID.users.length)
    );

    res.json({
      data: attendances,
      percentageAttendance,
    });
  } catch (err) {
    res.json({
      error: "Error: Couldn't generate 3 months report.",
    });
  }
};

const getSixMonthsReport = async (req, res) => {
  try {
    var last6Months = moment()
      .clone()
      .subtract(6, "months")
      .startOf("month")
      .format("YYYY-MM-DD");

    var today = moment().format("YYYY-MM-DD");

    const attendances = await Attendance.find(
      {
        date: {
          $gte: last6Months,
          $lte: today,
        },
        organizationID: req.params.id,
      },
      "date timeIn timeOut userName"
    ).populate("organizationID", "users");

    today = moment().format("YYYY-MM-ddd");
    last6Months = moment(last6Months, "YYYY-MM-DD").format("YYYY-MM-ddd");

    const diff = moment(today).diff(last6Months, "days") + 1;
    var workDays = diff - Math.floor(diff / 7);

    if (today.includes("Sun") || last6Months.includes("Sun")) workDays -= 1;

    const percentageAttendance = Math.floor(
      (attendances * 100) /
        (workDays * attendances[0].organizationID.users.length)
    );

    res.json({
      data: attendances,
      percentageAttendance,
    });
  } catch (err) {
    res.json({
      error: "Error: Couldn't generate 6 months report.",
    });
  }
};

const getUserReport = async (req, res) => {
  try {
    var startOfMonth = moment().clone().startOf("month").format("YYYY-MM-DD");
    var today = moment().format("YYYY-MM-DD");

    const attendances = await Attendance.find(
      {
        userID: req.params.userID,
        organizationID: req.params.orgID,
        date: {
          $gte: startOfMonth,
          $lte: today,
        },
      },
      "date timeIn timeOut"
    ).sort({ _id: -1 });

    const diff = moment(today).diff(startOfMonth, "days") + 1;

    today = moment().format("YYYY-MM-ddd");
    startOfMonth = moment(startOfMonth, "YYYY-MM-DD").format("YYYY-MM-ddd");

    var workDays = diff - Math.floor(diff / 7);
    if (today.includes("Sun") || startOfMonth.includes("Sun")) workDays -= 1;

    const percentageAttendance = Math.floor(
      (attendances.length * 100) / workDays
    );

    res.json({
      data: attendances,
      percentageAttendance,
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

    from = moment(from, "YYYY-MM-DD").format("YYYY-MM-DD");
    to = moment(to, "YYYY-MM-DD").format("YYYY-MM-DD");

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

    var percentageAttendance = 0;

    if (attendances.length > 0) {
      var diff = from == to ? 0 : moment(to).diff(from, "days") + 1;
      var workDays = diff - Math.floor(diff / 7);

      to = moment(to, "YYYY-MM-DD").format("YYYY-MM-ddd");
      from = moment(from, "YYYY-MM-DD").format("YYYY-MM-ddd");

      if (workDays > 0) {
        if (to.includes("Sun") || from.includes("Sun")) workDays -= 1;
      }

      if (workDays > 0)
        percentageAttendance = Math.floor(
          (attendances.length * 100) / workDays
        );
      else percentageAttendance = 100;
    }

    res.json({
      data: attendances,
      percentageAttendance,
    });
  } catch (err) {
    res.json({
      error: `Error: Couldn't generate report for user.`,
    });
  }
};

const getCustomReport = async (req, res) => {
  try {
    var { from, to } = req.body;

    from = moment(from, "YYYY-MM-DD").format("YYYY-MM-DD");
    to = moment(to, "YYYY-MM-DD").format("YYYY-MM-DD");

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
    )
      .populate("organizationID", "users")
      .sort({ _id: -1 });

    var percentageAttendance = 0;

    if (attendances.length > 0) {
      var diff = from == to ? 0 : moment(to).diff(from, "days") + 1;
      var workDays = diff - Math.floor(diff / 7);

      to = moment(to, "YYYY-MM-DD").format("YYYY-MM-ddd");
      from = moment(from, "YYYY-MM-DD").format("YYYY-MM-ddd");

      if (workDays > 0) {
        if (to.includes("Sun") || from.includes("Sun")) workDays -= 1;
      }

      if (workDays > 0)
        percentageAttendance = Math.floor(
          (attendances.length * 100) /
            (workDays * attendances[0].organizationID.users.length)
        );
      else percentageAttendance = 100;
    }

    res.json({
      data: attendances,
      percentageAttendance,
    });
  } catch (err) {
    res.json({
      error: "Error: Couldn't generate report.",
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
