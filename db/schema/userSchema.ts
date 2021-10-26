const mongoose = require("mongoose");

export const userSchema = new mongoose.Schema({
  name: String,
  authID: {
    type: Number,
    unique: true,
  },
  attendanceCount: Array,
  phone: String,
  address: String,
  salary: {
    type: Number,
    min: 0,
  },
  isAdmin: Boolean,
});
