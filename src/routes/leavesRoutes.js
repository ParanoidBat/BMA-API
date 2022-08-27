const {
  getAllRequests,
  getUserRequests,
  createRequest,
  updateRequest,
  deleteRequest,
} = require("../controllers/leavesController");
const express = require("express");

const router = express.Router();

router.route("/").get(getAllRequests).post(createRequest);
router
  .route("/:id")
  .get(getUserRequests)
  .put(updateRequest)
  .delete(deleteRequest);

module.exports = router;
