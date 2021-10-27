const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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

const Users = mongoose.model("Users", userSchema);

module.exports = Users;
