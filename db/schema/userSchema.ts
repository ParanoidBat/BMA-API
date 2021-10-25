const mongoose = require("mongoose");

export const userSchema = new mongoose.Schema({
  name: String,
  authID: String,
  attendanceCount: Array,
  phone: String,
  address: String,
  salary: Number,
  isAdmin: Boolean,
});
