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
  advance: {
    type: Object,
  },
  role: String,
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
