const Router = require("express").Router();
const {verifyAuthToken}  = require("../middlewares/authenticate");
const testController = require("../controllers/testControllers");

Router.get("/getquestions", verifyAuthToken, testController.getWebinarQuestions);

Router.post("/submitanswer", verifyAuthToken, testController.storeAgentResponse);

Router.get("/", testController.renderTestPage);

module.exports = Router;