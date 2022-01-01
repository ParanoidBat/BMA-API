const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  date: String,
  timeIn: String,
  timeOut: String,
});

const Attendance = mongoose.model("Attendances", attendanceSchema);

module.exports = {
  Attendance,
  attendanceSchema,
};
