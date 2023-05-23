const express = require("express");
const {
  updateUser,
  updateUserWithAuthID,
  deleteUser,
  getUser,
  getPercentageAttendance,
} = require("../controllers/user");

const router = express.Router();

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);
router.route("/:fingerID/:orgID").put(updateUserWithAuthID);
router.route("/percent_attendance/:userID/:orgID").get(getPercentageAttendance);

module.exports = router;
