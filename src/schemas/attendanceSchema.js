const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  timeIn: {
    type: String,
    required: true,
  },
  timeOut: String,
});

const Attendance = mongoose.model("Attendances", attendanceSchema);

module.exports = {
  Attendance,
  attendanceSchema,
};
