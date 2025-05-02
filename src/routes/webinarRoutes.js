const Router = require("express").Router();
const {verifyAuthToken} = require("../middlewares/authenticate");
const webinarController = require("../controllers/webinarControllers");

Router.get("/getwebinars", verifyAuthToken, webinarController.getWebinarList);

Router.get("/previewcertificate/:category", verifyAuthToken, webinarController.getCertificate);

Router.get("/getcertificate/:category", verifyAuthToken, webinarController.getCertificate);

Router.get("/", webinarController.renderWebinarHome);

module.exports = Router;