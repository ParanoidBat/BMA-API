const Attendance = require("../schemas/attendanceSchema");
const User = require("../schemas/userSchema");
const Organization = require("../schemas/organizationSchema");
const moment = require("moment");

/**
 * @api {post} /attendance/ Check In
 * @apiName CheckIn
 * @apiGroup Attendance
 *
 * @apiBody {Number} authID User's finger ID
 * @apiBody {String} organizationID Organization's ID the user belongs to
 * @apiBody {String} date Date of the checkin. Format: YYYY-MM-DD
 * @apiBody {String} timeIn The checkin time. Format: hh:mm:ss
 *
 * @apiDescription
 * Examples on date and time:
 * date: 2022-08-15
 * time: 05:15:16
 *
 * @apiSuccess {Boolean} data { data: true }
 */
const checkin = async (req, res) => {
  try {
    const user = await User.findOne({
      authID: req.body.authID,
      organizationID: req.body.organizationID,
    });
    const attendance = new Attendance(req.body);

    attendance.date = moment(attendance.date, "YYYY-MM-DD").format(
      "YYYY-MM-DD"
    );
    attendance.userName = user.name;
    attendance.userID = user._id;
    attendance.uniqueAttendanceString = `${user._id}${attendance.date}`;

    await attendance.save();
    Organization.findByIdAndUpdate(
      attendance.organizationID,
      {
        $push: {
          dailyAttendance: attendance,
        },
      },
      (err) => {
        if (err) throw err;
      }
    );

    res.json({
      data: true,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: Attendance couldn't be added.",
    });
  }
};

/**
 * @api {post} /attendance/checkout Check Out
 * @apiName Checkout
 * @apiGroup Attendance
 *
 * @apiBody {Number} authID
 * @apiBody {String} date
 * @apiBody {String} organizationID
 * @apiBody {String} timeOut
 *
 * @apiSuccess {Boolean} data { data: true }
 */
const checkout = async (req, res) => {
  // Doesn't matter if checked out on same day or not.
  try {
    const attendance = await Attendance.findOneAndUpdate(
      {
        authID: req.body.authID,
        date: {
          $eq: moment(req.body.date, "YYYY-MM-DD").format("YYYY-MM-DD"),
        },
        organizationID: req.body.organizationID,
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
  checkin,
  checkout,
};
