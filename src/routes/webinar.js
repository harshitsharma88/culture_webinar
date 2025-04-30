const Router = require("express").Router();
const webinarController = require("../controllers/webinarControllers");
const {verifyAuthToken}  = require("../middlewares/authenticate")

Router.get("/questions", verifyAuthToken, webinarController.getWebinarQuestions);

Router.get("/getwebinars", verifyAuthToken, webinarController.getWebinarList);

Router.get("/", webinarController.renderWebinarHome);

module.exports = Router;