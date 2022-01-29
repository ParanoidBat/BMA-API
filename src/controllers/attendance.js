const Attendance = require("../schemas/attendanceSchema");
const User = require("../schemas/userSchema");
const moment = require("moment");

const createAttendance = async (req, res) => {
  try {
    const user = await User.findOne({ authID: req.body.authID });
    const attendance = new Attendance(req.body);

    attendance.date = moment(attendance.date, "YYYY/MM/DD").format(
      "YYYY/MM/DD"
    );
    attendance.userName = user.name;
    attendance.uniqueAttendanceString = `${user.authID}${attendance.date}`;

    await attendance.save();

    res.json({
      data: true,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: Attendance couldn't be added.",
    });
  }
};

const checkout = async (req, res) => {
  // Doesn't matter if checked out on same day or not.
  try {
    const attendance = await Attendance.findOneAndUpdate(
      {
        authID: req.body.authID,
        date: {
          $eq: moment(req.body.date, "YYYY/MM/DD").format("YYYY/MM/DD"),
        },
      },
      {
        timeOut: req.body.timeOut,
      }
    );

    if (attendance != null) {
      await attendance.save();
    }

    res.json({
      data: true,
    });
  } catch (err) {
    res.json({
      error: "Couldn't checkout.",
    });
  }
};

module.exports = {
  createAttendance,
  checkout,
};
