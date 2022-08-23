const Attendance = require("../schemas/attendanceSchema");
const Organization = require("../schemas/organizationSchema");
const moment = require("moment");
const { remove } = require("lodash");

/*
 * 1 is added to moment.diff() results to include the present in the calculations
 */

const calculateLeaves = (startRange, endRange, leaves, isSaturdayOff) => {
  var totalLeaves = 0;

  if (!leaves.length) return 0;

  for (var i = leaves.length - 1; i > -1; i--) {
    if (leaves[i].from >= startRange) {
      if (leaves[i].to <= endRange) {
        totalLeaves += moment(leaves[i].to).diff(leaves[i].from, "days");

        if (!isSaturdayOff && leaves[i].to == endRange) totalLeaves += 1;
      } else {
        totalLeaves += moment(endRange).diff(leaves[i].from, "days");

        if (!isSaturdayOff) totalLeaves += 1;
      }
    } else if (leaves[i].to > startRange) {
      totalLeaves += moment(leaves[i].to).diff(startRange);
      if (!isSaturdayOff) totalLeaves += 1;
    } else if (leaves[i].from < startRange) break;
  }
  return totalLeaves;
};

const getTodayReport = async (req, res) => {
  try {
    const today = moment().format("YYYY-MM-DD");

    const organization = await Organization.findById(req.params.id).populate(
      "dailyAttendance",
      "date timeIn timeOut userName"
    );

    const removed = remove(organization.dailyAttendance, (attendance) => {
      return attendance.date != today;
    });

    if (removed.length) {
      Organization.findByIdAndUpdate(
        req.params.id,
        {
          $pull: {
            dailyAttendance: { $in: removed },
          },
        },
        (err) => {
          if (err) throw err;
        }
      );
    }

    const percentageAttendance =
      (organization.dailyAttendance.length / organization.usersCount) * 100;

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
    const { page } = req.query;
    const startOfWeek = moment().clone().startOf("week").format("YYYY-MM-DD");
    const today = moment().format("YYYY-MM-DD");
    var percentageAttendance = 0;

    var [attendances, count, organization] = await Promise.all([
      Attendance.find(
        {
          date: {
            $gt: startOfWeek,
            $lte: today,
          },
          organizationID: req.params.id,
        },
        "date timeIn timeOut userName"
      )
        .limit(10)
        .skip((page - 1) * 10),
      Attendance.find(
        {
          date: {
            $gt: startOfWeek,
            $lte: today,
          },
          organizationID: req.params.id,
        },
        "_id"
      ).countDocuments(),
      Organization.findById(req.params.id, "usersCount isSaturdayOff leaves"),
    ]);

    if (attendances.length) {
      const diff =
        moment(today).diff(startOfWeek, "days") +
        (organization.isSaturdayOff ? 0 : 1);

      percentageAttendance = Math.floor(
        (count * 100) / (organization.usersCount * diff)
      );
    }

    res.json({
      data: attendances,
      percentageAttendance,
      page,
      count,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: Couldn't generate weekly report.",
    });
  }
};

const getMonthlyReport = async (req, res) => {
  try {
    const { page } = req.query;
    var startOfMonth = moment().clone().startOf("month").format("YYYY-MM-DD");
    var today = moment().format("YYYY-MM-DD");
    var percentageAttendance = 0;

    var [attendances, count, organization] = await Promise.all([
      Attendance.find(
        {
          date: {
            $gte: startOfMonth,
            $lte: today,
          },
          organizationID: req.params.id,
        },
        "date timeIn timeOut userName"
      )
        .limit(10)
        .skip((page - 1) * 10),
      Attendance.find(
        {
          date: {
            $gte: startOfMonth,
            $lte: today,
          },
          organizationID: req.params.id,
        },
        "_id"
      ).countDocuments(),
      Organization.findById(req.params.id, "usersCount isSaturdayOff leaves"),
    ]);

    if (attendances.length) {
      const diff = moment(today).diff(startOfMonth, "days") + 1;

      today = moment().format("YYYY-MM-ddd");
      startOfMonth = moment(startOfMonth, "YYYY-MM-DD").format("YYYY-MM-ddd");

      var workDays = diff - Math.floor(diff / 7);
      if (today.includes("Sun") || startOfMonth.includes("Sun")) workDays -= 1;
      if (
        organization.isSaturdayOff &&
        (today.includes("Sat") || startOfMonth.includes("Sat"))
      )
        workDays -= 1;

      percentageAttendance = Math.floor(
        (count * 100) / (workDays * organization.usersCount)
      );
    }

    res.json({
      data: attendances,
      percentageAttendance,
      page,
      count,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: Couldn't generate monthly report.",
    });
  }
};

const getThreeMonthsReport = async (req, res) => {
  try {
    const { page } = req.query;
    var last3Months = moment()
      .clone()
      .subtract(3, "months")
      .startOf("month")
      .format("YYYY-MM-DD");

    var today = moment().format("YYYY-MM-DD");
    var percentageAttendance = 0;

    var [attendances, count, organization] = await Promise.all([
      Attendance.find(
        {
          date: {
            $gte: last3Months,
            $lte: today,
          },
          organizationID: req.params.id,
        },
        "date timeIn timeOut userName"
      )
        .limit(10)
        .skip((page - 1) * 10),
      Attendance.find(
        {
          date: {
            $gte: last3Months,
            $lte: today,
          },
          organizationID: req.params.id,
        },
        "_id"
      ).countDocuments(),
      Organization.findById(req.params.id, "usersCount isSaturdayOff leaves"),
    ]);

    if (attendances.length) {
      const diff = moment(today).diff(last3Months, "days") + 1;

      today = moment().format("YYYY-MM-ddd");
      last3Months = moment(last3Months, "YYYY-MM-DD").format("YYYY-MM-ddd");

      var workDays = diff - Math.floor(diff / 7);
      if (today.includes("Sun") || last3Months.includes("Sun")) workDays -= 1;
      if (
        organization.isSaturdayOff &&
        (today.includes("Sat") || last3Months.includes("Sat"))
      )
        workDays -= 1;

      percentageAttendance = Math.floor(
        (count * 100) / (workDays * organization.usersCount)
      );
    }

    res.json({
      data: attendances,
      percentageAttendance,
      page,
      count,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: Couldn't generate 3 months report.",
    });
  }
};

const getUserReport = async (req, res) => {
  try {
    const { page } = req.query;
    var startOfMonth = moment().clone().startOf("month").format("YYYY-MM-DD");
    var today = moment().format("YYYY-MM-DD");
    var percentageAttendance = 0;

    const [attendances, count, organization] = await Promise.all([
      Attendance.find(
        {
          userID: req.params.userID,
          date: {
            $gte: startOfMonth,
            $lte: today,
          },
        },
        "date timeIn timeOut"
      )
        .sort({ _id: -1 })
        .limit(10)
        .skip((page - 1) * 10),
      Attendance.find(
        {
          userID: req.params.userID,
          date: {
            $gte: startOfMonth,
            $lte: today,
          },
        },
        "_id"
      ).countDocuments(),
      Organization.findById(req.params.orgID, "isSaturdayOff"),
    ]);

    if (attendances.length) {
      const diff = moment(today).diff(startOfMonth, "days") + 1;

      today = moment().format("YYYY-MM-ddd");
      startOfMonth = moment(startOfMonth, "YYYY-MM-DD").format("YYYY-MM-ddd");

      var workDays = diff - Math.floor(diff / 7);
      if (today.includes("Sun") || startOfMonth.includes("Sun")) workDays -= 1;
      if (
        organization.isSaturdayOff &&
        (today.includes("Sat") || startOfMonth.includes("Sat"))
      )
        workDays -= 1;

      percentageAttendance = Math.floor((count * 100) / workDays);
    }

    res.json({
      data: attendances,
      percentageAttendance,
      page,
      count,
    });
  } catch (err) {
    res.status(500).json({
      error: `Error: Couldn't generate report for user.`,
    });
  }
};

const getFilteredUserReport = async (req, res) => {
  try {
    var { from, to } = req.body;
    var percentageAttendance = 0;
    const { page } = req.query;

    from = moment(from, "YYYY-MM-DD").format("YYYY-MM-DD");
    to = moment(to, "YYYY-MM-DD").format("YYYY-MM-DD");

    if (moment(from).isAfter(to)) [from, to] = [to, from];

    const [attendances, count, organization] = await Promise.all([
      Attendance.find(
        {
          userID: req.params.userID,
          date: {
            $lte: to,
            $gte: from,
          },
        },
        "date timeIn timeOut"
      )
        .sort({ _id: -1 })
        .limit(10)
        .skip((page - 1) * 10),
      Attendance.find(
        {
          userID: req.params.userID,
          date: {
            $lte: to,
            $gte: from,
          },
        },
        "_id"
      ).countDocuments(),
      Organization.findById(req.params.orgID, "isSaturdayOff"),
    ]);

    if (attendances.length) {
      var diff = from == to ? 0 : moment(to).diff(from, "days") + 1;
      var workDays = diff - Math.floor(diff / 7);

      to = moment(to, "YYYY-MM-DD").format("YYYY-MM-ddd");
      from = moment(from, "YYYY-MM-DD").format("YYYY-MM-ddd");

      if (workDays) {
        if (to.includes("Sun") || from.includes("Sun")) workDays -= 1;
        if (
          organization.isSaturdayOff &&
          (to.includes("Sat") || from.includes("Sat"))
        )
          workDays -= 1;

        try {
          percentageAttendance = Math.floor((count * 100) / workDays);
        } catch (err) {
          throw err;
        }
      }
    }

    res.json({
      data: attendances,
      percentageAttendance,
      page,
      count,
    });
  } catch (err) {
    res.status(500).json({
      error: `Error: Couldn't generate report for user.`,
    });
  }
};

const getCustomReport = async (req, res) => {
  try {
    var { from, to } = req.body;
    const { page } = req.query;
    var percentageAttendance = 0;

    from = moment(from, "YYYY-MM-DD").format("YYYY-MM-DD");
    to = moment(to, "YYYY-MM-DD").format("YYYY-MM-DD");

    if (moment(from).isAfter(to)) [from, to] = [to, from];

    const [attendances, count, organization] = await Promise.all([
      Attendance.find(
        {
          organizationID: req.params.id,
          date: {
            $lte: to,
            $gte: from,
          },
        },
        "userName date timeIn timeOut"
      )
        .sort({ _id: -1 })
        .limit(10)
        .skip((page - 1) * 10),
      Attendance.find(
        {
          organizationID: req.params.id,
          date: {
            $lte: to,
            $gte: from,
          },
        },
        "_id"
      ).countDocuments(),
      Organization.findById(req.params.id, "usersCount isSaturdayOff"),
    ]);

    if (attendances.length) {
      var diff = from == to ? 0 : moment(to).diff(from, "days") + 1;
      var workDays = diff - Math.floor(diff / 7);

      to = moment(to, "YYYY-MM-DD").format("YYYY-MM-ddd");
      from = moment(from, "YYYY-MM-DD").format("YYYY-MM-ddd");

      if (workDays) {
        if (to.includes("Sun") || from.includes("Sun")) workDays -= 1;
        if (
          organization.isSaturdayOff &&
          (to.includes("Sat") || from.includes("Sat"))
        )
          workDays -= 1;

        try {
          percentageAttendance = Math.floor(
            (count * 100) / (workDays * organization.usersCount)
          );
        } catch (err) {
          throw err;
        }
      }
    }

    res.json({
      data: attendances,
      percentageAttendance,
      page,
      count,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: Couldn't generate report.",
    });
  }
};

module.exports = {
  getTodayReport,
  getWeeklyReport,
  getMonthlyReport,
  getThreeMonthsReport,
  getUserReport,
  getFilteredUserReport,
  getCustomReport,
};
