const mongoose = require("mongoose");
const Users = require("./userSchema");

const attendanceSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  authID: {
    type: Number,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  timeIn: String,
  timeOut: String,
});

attendanceSchema.post("save", async (doc) => {
  try {
    await Users.findOneAndUpdate(
      { authID: doc.authID },
      {
        $push: {
          attendanceCount: doc._id,
        },
      },
      function (error, success) {
        if (error) throw error;
      }
    );
  } catch (err) {
    console.log(err);
  }
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = {
  Attendance,
  attendanceSchema,
};
