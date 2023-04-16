const {
  getOrganization,
  getOrganizationUsersList,
  updateOrganization,
} = require("../controllers/organization");

const express = require("express");

const router = express.Router();

router.route("/:id").get(getOrganization).put(updateOrganization);
router.route("/:id/users").get(getOrganizationUsersList);

module.exports = router;
