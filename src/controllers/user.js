const User = require("../schemas/userSchema");
const Organization = require("../schemas/organizationSchema");
const Credentials = require("../schemas/credentialsSchema");
const Attendance = require("../schemas/attendanceSchema");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const { findIndex, find } = require("lodash");

const calculateLeaves = (userLeaves, isSatOff, attendances) => {
  // Find holes in attendance, if a hole is accounted for in leaves; add into total leaves
  let leaves = 0;
  const workDays = isSatOff ? 5 : 6;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  let index = findIndex(
    days,
    (day) => day === moment().clone().startOf("month").format("ddd")
  );
  if (index == -1) index = 0;

  attendances.forEach((obj) => {
    const day = moment(obj.date, "YYYY-MM-DD").format("ddd");

    if (day !== days[index % workDays]) {
      const leave = find(userLeaves, (leaveObj) => {
        return (
          moment(obj.date, "YYYY-MM-DD").isSameOrAfter(
            moment(leaveObj.from, "YYYY-MM-DD")
          ) &&
          moment(obj.date, "YYYY-MM-DD").isSameOrBefore(
            moment(leaveObj.to, "YYYY-MM-DD")
          )
        );
      });

      if (leave) leaves++;
    }

    index++;
  });

  return leaves;
};

const createUser = async (req, res) => {
  try {
    const user = new User(req.body);

    await user.save();

    const credentials = new Credentials(req.body);
    credentials.user = user;
    credentials.password = await bcrypt.hash(credentials.password, 10);
    await credentials.save();

    Organization.findByIdAndUpdate(
      user.organizationID,
      {
        $push: {
          users: user._id,
        },
        $inc: { usersCount: user.role != "Admin" ? 1 : 0 },
      },
      (err) => {
        if (err) throw err;
      }
    );

    res.json({
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: Couldn't create user.",
    });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      req.body,
      {
        runValidators: true,
        new: true,
      },
      (err) => {
        if (err) throw err;
      }
    );

    res.json({
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: Couldn't update user.",
    });
  }
};

const updateUserWithAuthID = async (req, res) => {
  const { authID, organizationID } = req.params;
  try {
    const user = await User.findOneAndUpdate(
      { authID: authID, organizationID: organizationID },
      req.body,
      {
        runValidators: true,
      },
      (err) => {
        if (err) throw err;
      }
    );

    res.json({
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: Couldn't update user.",
    });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await User.findByIdAndDelete(id);

    res.json({
      data: true,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: Couldn't delete user.",
    });
  }
};

const getUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    res.json({
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: Couldn't get user.",
    });
  }
};

const getUsersList = async (req, res) => {
  try {
    const { page } = req.query;

    const users = await User.find({}, "_id name organizationID")
      .sort({
        name: 1,
      })
      .limit(10)
      .skip((page - 1) * 10);

    res.json({
      data: users,
      page,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: Couldn't get users list.",
    });
  }
};

const getPercentageAttendance = async (req, res) => {
  try {
    var startOfMonth = moment().clone().startOf("month").format("YYYY-MM-DD");
    var today = moment().format("YYYY-MM-DD");
    var percentageAttendance = 0;

    const [userLeaves, attendances, count, organization] = await Promise.all([
      User.findById(req.params.userID, "leaves"),
      Attendance.find(
        {
          userID: req.params.userID,
          date: {
            $gte: startOfMonth,
            $lte: today,
          },
        },
        "date"
      ).sort({ date: 1 }),
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

    if (count) {
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

      const leaves = calculateLeaves(
        userLeaves.leaves,
        organization.isSaturdayOff,
        attendances
      );
      percentageAttendance = Math.floor(((count + leaves) * 100) / workDays);
    }

    res.json({
      data: percentageAttendance,
    });
  } catch (err) {
    res.status(500).json({
      error: `Error: Couldn't get user percentage attendance.`,
    });
  }
};

module.exports = {
  createUser,
  updateUser,
  updateUserWithAuthID,
  deleteUser,
  getUser,
  getUsersList,
  getPercentageAttendance,
};
