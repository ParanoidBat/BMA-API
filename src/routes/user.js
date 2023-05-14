const express = require("express");
const {
  updateUser,
  updateUserWithAuthID,
  deleteUser,
  getUser,
  getPercentageAttendance,
  getUserPackage,
} = require("../controllers/user");

const router = express.Router();

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);
router.route("/:fingerID/:orgID").put(updateUserWithAuthID);
router.route("/percent_attendance/:userID/:orgID").get(getPercentageAttendance);
router.route("/package/:id").get(getUserPackage);

module.exports = router;
