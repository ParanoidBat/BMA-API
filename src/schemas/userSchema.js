const mongoose = require("mongoose");
const { attendanceSchema } = require("./attendanceSchema");
const Advance = require("./advanceSchema");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  authID: {
    type: Number,
    unique: true,
  },
  attendanceCount: {
    type: [attendanceSchema],
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
    type: Object,
  },
  role: {
    type: String,
    enum: ["Admin", "Worker", "Manager"],
    default: "Worker",
  },
});

userSchema.post("findOne", async (doc) => {
  if (doc) {
    const userAdvance = await Advance.findOne({ userID: doc._id });
    doc.advance = userAdvance;
  }
});

userSchema.post("findOneAndDelete", async (doc) => {
  if (doc) {
    try {
      await Advance.findOneAndDelete({ userID: doc._id });
    } catch (err) {
      console.log("Couldn't delete corresponding advance");
    }
  }
});

const Users = mongoose.model("Users", userSchema);

module.exports = Users;
