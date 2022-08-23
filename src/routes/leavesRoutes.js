const {
  getAllRequests,
  getRequest,
  createRequest,
  updateRequest,
  deleteRequest,
} = require("../controllers/leavesController");
const express = require("express");

const router = express.Router();

router.route("/").get(getAllRequests).post(createRequest);
router.route("/:id").get(getRequest).put(updateRequest).delete(deleteRequest);

module.exports = router;
