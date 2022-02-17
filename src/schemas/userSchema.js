const mongoose = require("mongoose");
const Organization = require("./organizationSchema");
const Attendance = require("./attendanceSchema");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
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
    default: 0,
  },
  advance: {
    type: Number,
    min: 0,
    default: 0,
  },
  role: {
    type: String,
    enum: ["Admin", "Worker", "Manager"],
    default: "Worker",
  },
});

userSchema.post("findOneAndDelete", async (doc) => {
  if (doc) {
    await Organization.findByIdAndUpdate(doc.organizationID, {
      $pull: { users: doc._id },
    });
    await Attendance.deleteMany({ userID: doc._id });
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
