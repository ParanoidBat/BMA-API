const express = require("express");
const { createUser, createUserFromDevice } = require("../controllers/user");
const { createOrganization } = require("../controllers/organization");

const router = express.Router();

router.route("/user").post(createUser);
router.route("/user/create_from_device").post(createUserFromDevice);

router.route("/organization").post(createOrganization);

module.exports = router;
