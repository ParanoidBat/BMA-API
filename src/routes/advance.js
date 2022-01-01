const {
  createAdvance,
  updateAdvance,
  deleteAdvance,
  getAdvancesList,
} = require("../controllers/advance");
const express = require("express");

const router = express.Router();

router.route("/").get(getAdvancesList).post(createAdvance);
router.route("/:id").put(updateAdvance).delete(deleteAdvance);

module.exports = router;
