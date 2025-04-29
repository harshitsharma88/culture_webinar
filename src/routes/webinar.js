const Router = require("express").Router();
const webinarController = require("../controllers/webinarControllers");

Router.get("/", webinarController.renderWebinarHome);

module.exports = Router;