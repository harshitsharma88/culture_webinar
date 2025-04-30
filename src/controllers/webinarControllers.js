const catchBlock = require("../errorHandlers/errorPrinting");
const { executeStoredProcedure } = require("../config/dbExec")

const webinarController = {
    async renderWebinarHome(req, res, next){
        try {
            res.sendFile(require("path").join(__dirname, "../../","/public/views/webinar.html"));
        } catch (error) {
            catchBlock(error, "Rendering Home Page.");
        }
    },
    async getWebinarList(req, res, next){
        const category = req.query.category || null;
        try {
            const result = await executeStoredProcedure("USP_GetWebinarListChecking_AgentTestAttempt", 
                [{name : "Agentid", value : req.agentinfo.agentid}, {name : "category_type", value : category}]);
            return res.status(200).json({webinars : result});
        } catch (error) {
            catchBlock(error, "Getting Webinar List.");
        }
    }
}

module.exports = webinarController;