const express = require("express");
const {
  getOrganizationsList,
  deleteOrganization,
} = require("../controllers/organization");
const { getUsersList } = require("../controllers/user");

const router = express.Router();

router.route("/organization/").get(getOrganizationsList);
router.route("/organization/:id").delete(deleteOrganization);

router.route("/user/").get(getUsersList);

module.exports = router;
