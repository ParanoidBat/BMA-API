const mongoose = require("mongoose");

export const attendanceSchema = new mongoose.Schema({
  date: String,
  timeIn: String,
  timeOut: String,
});
