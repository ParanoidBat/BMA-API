const {
  getOrganization,
  getOrganizationsList,
  getOrganizationUsersList,
  updateOrganization,
  deleteOrganization,
} = require("../controllers/organization");

const express = require("express");

const router = express.Router();

router.route("/").get(getOrganizationsList);
router
  .route("/:id")
  .get(getOrganization)
  .put(updateOrganization)
  .delete(deleteOrganization);
router.route("/:id/users").get(getOrganizationUsersList);

module.exports = router;
