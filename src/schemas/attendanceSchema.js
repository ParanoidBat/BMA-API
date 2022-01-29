const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  uniqueAttendanceString: {
    type: String,
    required: true,
    unique: true,
  },
  date: {
    type: String,
    required: true,
  },
  authID: {
    type: Number,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  timeIn: String,
  timeOut: String,
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;
