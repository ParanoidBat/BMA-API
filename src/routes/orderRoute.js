const express = require("express");
const db = require("../../database");
const { createOrder } = require("../controllers/orderController");

const router = express.Router();

router.route("/:id").post(createOrder);

module.exports = router;
