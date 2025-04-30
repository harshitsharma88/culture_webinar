const catchBlock = require("../errorHandlers/errorPrinting");

function verifyAuthToken (req, res, next){
    try {
        console.log("in auth")
        // if(!req.header("Authorization")){
        //     return res.status(401).json('Auth Token missing');
        // }
        // const decodedData = jwt.verify( req.header("Authorization"), process.env.jsecret);
        // if(!decodedData) return res.status(401).json("Redirect");
        // req.agentid = decodedData.agentid
        req.agentid = 'chagt000003780'
        next();
    } catch (error) {
        res.status(401).json("Redirect");
        catchBlock(error, 'Verifying JWT')
    }
}    

module.exports = {verifyAuthToken}