const express = require("express");
const {
  createUser,
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
router.route("/:authID/:organizationID").put(updateUserWithAuthID);
router.route("/percent_attendance/:userID/:orgID").get(getPercentageAttendance);

module.exports = router;
