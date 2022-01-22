const express = require("express");
const {
  createUser,
  updateUser,
  updateUserWithAuthID,
  deleteUser,
  getUser,
  getUsersList,
} = require("../controllers/user");

const router = express.Router();

router.route("/").get(getUsersList).post(createUser);
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);
router.route("/:authID").put(updateUserWithAuthID);

module.exports = router;
