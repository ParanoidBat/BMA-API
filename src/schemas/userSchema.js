const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  // token: String,
  authID: {
    type: Number,
    required: true,
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

const User = mongoose.model("User", userSchema);

module.exports = User;
