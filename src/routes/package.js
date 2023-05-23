const express = require("express");
const {
  getAllPackages,
  getRelevantPackages,
  createPackage,
} = require("../controllers/package");

const router = express.Router();

router.route("/").get(getAllPackages).post(createPackage);
router.route("/:org_id").get(getRelevantPackages);

module.exports = router;
