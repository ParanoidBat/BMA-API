const express = require("express");
const {
  getOrganizationsList,
  deleteOrganization,
} = require("../controllers/organization");
const { getUsersList } = require("../controllers/user");
const {
  getPendingOrders,
  orderDelivered,
} = require("../controllers/orderController");

const router = express.Router();

router.route("/organization/").get(getOrganizationsList);
router.route("/organization/:id").delete(deleteOrganization);

router.route("/user/").get(getUsersList);

router.route("/order/:id").put(orderDelivered);
router.route("/order").get(getPendingOrders);

module.exports = router;
