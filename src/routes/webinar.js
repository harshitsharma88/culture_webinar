const Router = require("express").Router();
const webinarController = require("../controllers/webinarControllers");
const {verifyAuthToken}  = require("../middlewares/authenticate")

Router.get("/questions", verifyAuthToken);

Router.get("/", webinarController.renderWebinarHome);

module.exports = Router;