const {
  createOrganization,
  getOrganization,
  getOrganizationsList,
  getOrganizationUsersList,
  updateOrganization,
  deleteOrganization,
  createUserLeaves,
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
router.route("/:id/leave").put(createUserLeaves);

module.exports = router;
