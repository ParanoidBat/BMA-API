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
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  organizationID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
  },
  timeIn: String,
  timeOut: String,
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = { Attendance, attendanceSchema };
