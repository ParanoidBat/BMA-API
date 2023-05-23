const express = require("express");
const { createOrgProduct } = require("../controllers/orgProducts");

const router = express.Router();

router.route("/").post(createOrgProduct);

module.exports = router;
