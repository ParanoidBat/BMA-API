const {
  createAdvance,
  updateAdvance,
  deleteAdvance,
} = require("../controllers/advance");
const express = require("express");

const router = express.Router();

router
  .route("/:id")
  .post(createAdvance)
  .put(updateAdvance)
  .delete(deleteAdvance);

module.exports = router;
