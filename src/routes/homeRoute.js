const Router = require("express").Router();

Router.use("/test", require("./testRoute"));

Router.use("/", require("./webinarRoutes"));

module.exports = Router;