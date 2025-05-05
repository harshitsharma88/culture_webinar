const catchBlock = require("../errorHandlers/errorPrinting");
const {verifyToken, generateToken} = require("../utils/helpers");

function verifyAuthToken (req, res, next){
    try {
        if(!req.header("Authorization")){
            return res.status(401).json('Auth Token missing');
        }
        const decodedData = verifyToken(req.header("Authorization"));
        if(!decodedData) return res.status(401).json("Redirect");
        const newToken = generateToken({agentData : decodedData.agentData}, {expiresIn : "5m"});
        req.agentinfo = decodedData.agentData;
        res.set('Authorization', newToken);
        res.setHeader('Access-Control-Expose-Headers', 'Authorization');
        next();
    } catch (error) {
        res.status(401).json({message : "Not Authorized"});
        catchBlock(error, 'Verifying JWT')
    }
}    

module.exports = {verifyAuthToken}