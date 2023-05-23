const { createProduct } = require("../controllers/product");
const express = require("express");

const router = express.Router();

router.route("/").post(createProduct);

module.exports = router;
