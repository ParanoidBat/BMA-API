const express = require("express");
const login = require("../controllers/login");

const Router = express.Router();

Router.route("/").post(login);

module.exports = Router;
