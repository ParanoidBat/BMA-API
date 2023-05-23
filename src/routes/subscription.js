const express = require("express");
const { createSubscription } = require("../controllers/subscription");

const router = express.Router();

router.route("/").post(createSubscription);

module.exports = router;
