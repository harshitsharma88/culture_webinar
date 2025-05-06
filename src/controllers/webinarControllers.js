const catchBlock = require("../errorHandlers/errorPrinting");
const { executeStoredProcedure } = require("../config/dbExec");
const { renderEJS, generateCertificate, generateToken} = require("../utils/helpers");

const webinarController = {
    async renderWebinarHome(req, res, next){
        try {
            const uid = req.params.uid || null;
            // if(!uid) return res.redirect("/");
            const {jwtToken, data} = await webinarController.verifyUserAndCreateLogin(uid);
            res.render("webinar", {
                token : jwtToken, 
                agentname : data.agentname, 
                agentemail : data.emailid,
                agentcompany : data.comp_name
            });
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
            if(result.length === 0 || result[0].STATUS !== "Passed"){
                return res.status(400).json({message : "No certificate found."});
            }
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const dateString = new Date(result[0].END_TIME).toLocaleDateString('en-US', options);
            const html = await renderEJS({agentname : req.agentinfo.agentname, countryname : category, date : dateString, countrybatchname : category});
            if(req.originalUrl.includes('/previewcertificate')){
                res.set('Content-Type', 'text/html');
                return res.send(html);
            }
            const certificate = await generateCertificate(html);
            res.set('Content-Type', 'image/png');
            res.set('Content-Disposition', 'inline; filename=certificate.png');
            res.end(certificate);
        } catch (error) {
            catchBlock(error, "Rendering Certificate Page.");
        }
    },
    async verifyUserAndCreateLogin(uid){
        try {
            // const params = [{name :"UserID", value : req.body.userid}, {name : "Password", value : req.body.password}];
            // const result = await executeStoredProcedure("GetLoginAgentByUserId_V4", params);
            // if(result.length === 0) return res.status(403).json({message : "Invalid Credentials."});
            // const data = {username : result[0].UserName, 
            //     agentid : result[0].AgentID, 
            //     agentname : result[0].Name, 
            //     email : result[0].Emailid,
            //     comp_name : result[0].Comp_Name
            // };

            const data = {
                username : "ashish.bhasin@travelchacha.com", 
                agentid : "chagt000003780", 
                agentname : "Ashish Bhasin", 
                emailid : "developer@cultureholidays.com",
                comp_name : "Culture Holidays123"
            };
            const jwtToken = generateToken({agentData : data}, {expiresIn: '5m'});
            return {jwtToken, data};
        } catch (error) {
            catchBlock(error, "Verifying User and Creating Login.");
            return null;
        }
    },
    async submitReplayURLrequest(req, res, next){
        try {

        } catch (error) {
            catchBlock(error, "Submitting Replay URL request.");
        }
    }
}

module.exports = webinarController;