const jwt = require("jwt")

const heplers = {
    generateToken ( data, options ){
        return jwt.sign(data, process.env.jsecret, options);
    }
};

module.exports = heplers;