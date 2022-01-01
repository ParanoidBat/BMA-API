const User = require("../schemas/userSchema");

const createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();

    res.json({
      data: true,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error: Couldn't create user.",
    });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;

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
    const user = await User.findById(id);

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
    const users = await User.find({}, "_id name salary advance").sort({
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
  deleteUser,
  getUser,
  getUsersList,
};
