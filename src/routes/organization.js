const {
  createOrganization,
  getOrganization,
  getOrganizationsList,
  getOrganizationUsersList,
  updateOrganization,
  deleteOrganization,
} = require("../controllers/organization");

const express = require("express");

const router = express.Router();

router.route("/").get(getOrganizationsList).post(createOrganization);
router
  .route("/:id")
  .get(getOrganization)
  .put(updateOrganization)
  .delete(deleteOrganization);
router.route("/:id/users").get(getOrganizationUsersList);

module.exports = router;
