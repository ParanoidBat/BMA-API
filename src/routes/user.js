const express = require("express");
const {
  createUser,
  updateUser,
  deleteUser,
  getUser,
  getUsersList,
} = require("../controllers/user");

const router = express.Router();

router.route("/").get(getUsersList).post(createUser);
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
