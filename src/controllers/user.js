const User = require("../schemas/userSchema");
const { Attendance } = require("../schemas/attendanceSchema");
const moment = require("moment");

const createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    const attendance = new Attendance({
      date: moment().format("YYYY/MM/DD"),
      authID: user.authID,
      timeIn: moment().format("h:mm:ss"),
      userName: user.name,
    });

    await user.save();
    await attendance.save();

    res.json({
      data: true,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: Couldn't create user.",
    });
  }
};

const updateUser = async (req, res, next) => {
  const { id } = req.params;

  if (id.length <= 3) {
    return next("route");
  }

  try {
    const user = await User.findByIdAndUpdate(id, req.body, {
      runValidators: true,
      new: true,
    });

    await user.save();

    res.json({
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: Couldn't update user.",
    });
  }
};

const updateUserWithAuthID = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { authID: req.params.authID },
      req.body,
      {
        runValidators: true,
      }
    );

    if (user == null) throw "User doesn't exist";

    await user.save();

    res.json({
      data: true,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Error: Couldn't update user.",
    });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await User.findByIdAndDelete(id);

    res.json({
      data: true,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: Couldn't delete user.",
    });
  }
};

const getUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).populate("attendanceCount");

    res.json({
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: Couldn't get user.",
    });
  }
};

const getUsersList = async (req, res) => {
  try {
    const users = await User.find({}, "_id name salary hasAdvance").sort({
      name: 1,
    });

    res.json({
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: Couldn't get users list.",
    });
  }
};

module.exports = {
  createUser,
  updateUser,
  updateUserWithAuthID,
  deleteUser,
  getUser,
  getUsersList,
};