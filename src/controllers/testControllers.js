const catchBlock = require("../errorHandlers/errorPrinting");
const { executeStoredProcedure } = require("../config/dbExec");
const { param } = require("../app");

const testControllers = {
    async renderTestPage(req, res, next){
        try {
            res.sendFile(require("path").join(__dirname, "../../","/public/views/webinarTest.html"));
        } catch (error) {
            console.log(error)
            catchBlock(error, "Rendering Test Page", res);
        }
    },
    async getWebinarQuestions(req, res, next){
        try {
            const category = req.query.category;
            const agentTestDetails_Promise = executeStoredProcedure("USP_GetWebinarListChecking_AgentTestAttempt", 
                [{name : "Agentid", value : req.agentinfo.agentid}, {name : "category_type", value : category}]);
            const resultQuestions_Promise = executeStoredProcedure('usp_GetWebinarQuestions', [{name : "Country", value : category}]);
            const [{value : agentTestDetails}, {value : questions}] 
                = await Promise.allSettled([agentTestDetails_Promise, resultQuestions_Promise]);
            if(Array.isArray(agentTestDetails) && agentTestDetails.length > 0 && agentTestDetails[0].STATUS === "Passed"){
                return res.status(409).json({message : "You have already passed the test"});
            }
            return res.status(200).json({questions});
        } catch (error) {
            catchBlock(error, "Getting Questions", res);
        }
    },
    async storeAgentResponse(req, res, next){
        try {
            const answerDetails = JSON.stringify(req.body.answerDetails || []);
            const params = [
                { name: "agent_name", value: req.agentinfo.agentname},
                { name: "emailid", value: req.agentinfo.emailid },
                { name: "agentid", value: req.agentinfo.agentid },
                { name: "category_type", value: req.body.categoryType || 'Dubai'},
                { name: "country", value: req.body.country || 'Dubai'},
                { name: "current_question", value: req.body.currentQuestion || 1},
                { name: "answer_details", value: answerDetails},
                { name: "status", value: req.body.status || "In Progress"},
                { name: "score", value: req.body.score },
                { name: "end_time", value: req.body.endTime || null},
                { name: "certificate_downloaded", value: req.body.certificateDownloaded || null},
                { name: "certificate_download_date", value: req.body.certificateDownloadDate || null},
                { name: "new_attempt", value: req.body.newAttempt || null}
            ];
            const result = await executeStoredProcedure('USP_InsertWebinarAnswerRecords', params);
            return res.status(200).json({response : result});
        }catch(error){
            catchBlock(error, "Storing Agent Response", res);
        }
    }
}

module.exports = testControllers;