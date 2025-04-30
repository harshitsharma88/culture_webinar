const catchBlock = require("../errorHandlers/errorPrinting");
const { executeStoredProcedure } = require("../dbConfig/dbExec")

const webinarController = {
    async renderWebinarHome(req, res, next){
        try {
            res.sendFile(require("path").join(__dirname, "../../","/public/views/webinar.html" ));
        } catch (error) {
            catchBlock(error, "Rendering Home Page.")
        }
    },
    async getWebinarQuestions(req, res, next){
        try {
            const result = await executeStoredProcedure('usp_GetWebinarQuestions', [{name : "Country", value : req.query.country}]);
            return res.status(200).json({questions : result});
        } catch (error) {
            catchBlock(error, "Getting Questions", res);
        }
    },
    async getWebinarList(req, res, next){
        try {
            const result = await executeStoredProcedure("USP_GetWebinarListChecking_AgentTestAttempt", 
                [{name : "Agentid", value : req.agentid}]);
            return res.status(200).json({webinars : result});
        } catch (error) {
            catchBlock(error, "")
        }
    },
    async storeQuestionRecords(req, res, next){
        try {
            const agentid = req.agentid;
            const params = [];
            const result = await executeStoredProcedure("USP_InsertWebinarAnswerRecords", params);
        } catch (error) {
            catchBlock(error, "Storing Answer Records", res)
        }
    }
}

module.exports = webinarController;