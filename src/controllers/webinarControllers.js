const catchBlock = require("../errorHandlers/errorPrinting");

const webinarController = {
    async renderWebinarHome(req, res, next){
        try {
            res.sendFile(require("path").join(__dirname, "../../","/public/views/webinar.html" ));
        } catch (error) {
            catchBlock(error, "Rendering Home Page.")
        }
    }
}

module.exports = webinarController;