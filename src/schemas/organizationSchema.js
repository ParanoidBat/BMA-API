const mongoose = require("mongoose");

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
  email: {
    type: String,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    unique: true,
  },
  usersCount: {
    type: Number,
    default: 0,
  },
  isSaturdayOff: {
    type: Boolean,
    default: false,
  },
  users: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
  },
  dailyAttendance: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Attendance",
  },
});

const Organization = mongoose.model("Organization", organizationSchema);

module.exports = Organization;
