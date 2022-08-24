const User = require("../schemas/userSchema");
const Organization = require("../schemas/organizationSchema");
const Credentials = require("../schemas/credentialsSchema");
const bcrypt = require("bcryptjs");

const createUser = async (req, res) => {
  try {
    const user = new User(req.body);

    await user.save();

    if (req.body.email) {
      const credentials = new Credentials(req.body);
      credentials.user = user;
      credentials.password = await bcrypt.hash(credentials.password, 10);
      await credentials.save();
    }

    Organization.findByIdAndUpdate(
      user.organizationID,
      {
        $push: {
          users: user._id,
        },
        $inc: { usersCount: user.role != "Admin" ? 1 : 0 },
      },
      (err) => {
        if (err) throw err;
      }
    );

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
    const user = await User.findByIdAndUpdate(
      id,
      req.body,
      {
        runValidators: true,
        new: true,
      },
      (err) => {
        if (err) throw err;
      }
    );

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
  const { authID, organizationID } = req.params;
  try {
    const user = await User.findOneAndUpdate(
      { authID: authID, organizationID: organizationID },
      req.body,
      {
        runValidators: true,
      },
      (err) => {
        if (err) throw err;
      }
    );

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
    const { page } = req.query;

    const users = await User.find({}, "_id name organizationID")
      .sort({
        name: 1,
      })
      .limit(10)
      .skip((page - 1) * 10);

    res.json({
      data: users,
      page,
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
