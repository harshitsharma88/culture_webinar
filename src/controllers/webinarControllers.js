const catchBlock = require("../errorHandlers/errorPrinting");
const { executeStoredProcedure } = require("../config/dbExec");
const { renderEJS, generateCertificate } = require("../utils/helpers");

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
    },
    async getCertificate(req, res, next){
        const category = req.params.category || null;
        try {
            if(!category){
                return res.status(400).json({message : "Category is required."});
            }
            const result = await executeStoredProcedure("USP_GetWebinarListChecking_AgentTestAttempt", 
                [{name : "Agentid", value : req.agentinfo.agentid}, {name : "category_type", value : category}]);
            if(result.length === 0 || !result[0].STATUS !== "Passed"){
                return res.status(400).json({message : "No certificate found."});
            }
            const html = await renderEJS({agentname : "Test Test", countryname : "India", date : "May 01 2025", countrybatchname : "Greece"});
            if(req.originalUrl.includes('/previewcertificate')){
                res.set('Content-Type', 'text/html');
                return res.send(html);
            }
            const certificate = await generateCertificate(html);
            res.set('Content-Type', 'image/png');
            res.set('Content-Disposition', 'inline; filename=certificate.png');
            res.end(certificate); // ensure you're sending raw buffer
        } catch (error) {
            catchBlock(error, "Rendering Certificate Page.");
        }
    }
}

module.exports = webinarController;