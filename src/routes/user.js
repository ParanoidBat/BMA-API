const express = require("express");
const {
  createUser,
  createUserFromDevice,
  updateUser,
  updateUserWithAuthID,
  deleteUser,
  getUser,
  getUsersList,
  getPercentageAttendance,
} = require("../controllers/user");

const router = express.Router();

router.route("/").get(getUsersList).post(createUser);
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);
router.route("/:fingerID/:orgID").put(updateUserWithAuthID);
router.route("/percent_attendance/:userID/:orgID").get(getPercentageAttendance);
router.route("/create_from_device").post(createUserFromDevice);

module.exports = router;
