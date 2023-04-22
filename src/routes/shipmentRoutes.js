const express = require("express");
const {
  getDetails,
  createOrUpdateDetails,
} = require("../controllers/shipmentController");

const router = express.Router();

router.route("/:id").get(getDetails).post(createOrUpdateDetails);

module.exports = router;
