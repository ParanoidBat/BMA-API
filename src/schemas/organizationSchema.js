const mongoose = require("mongoose");
const { attendanceSchema } = require("./attendanceSchema");

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  users: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
  },
  dailyAttendance: [attendanceSchema],
});

const Organization = mongoose.model("Organization", organizationSchema);

module.exports = Organization;
