const express = require("express");
const { getPackages, applyPackage } = require("../controllers/package");

const router = express.Router();

router.route("/").get(getPackages).post(applyPackage);

module.exports = router;
