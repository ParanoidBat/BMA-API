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

module.exports = {
  getTodayReport,
};
