const Attendance = require("../schemas/attendanceSchema");
const User = require("../schemas/userSchema");

const createAttendance = async (req, res) => {
  const { authID } = req.params;

  try {
    const user = await User.findOne({ authID: authID });

    user.attendanceCount.push(req.body);

    await user.save();

    res.json({
      data: true,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: Attendance couldn't be added.",
    });
  }
};

module.exports = {
  createAttendance,
};
