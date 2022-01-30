const {
  createOrganization,
  getOrganization,
  getOrganizationsList,
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

module.exports = router;
