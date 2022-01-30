const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  authID: {
    type: Number,
    required: true,
    unique: true,
  },
  organizationID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  phone: String,
  address: String,
  salary: {
    type: Number,
    min: 0,
  },
  hasAdvance: {
    type: Boolean,
    default: false,
  },
  advance: {
    type: Number,
    min: 0,
  },
  role: {
    type: String,
    enum: ["Admin", "Worker", "Manager"],
    default: "Worker",
  },
});

const User = mongoose.model("Users", userSchema);

module.exports = User;
