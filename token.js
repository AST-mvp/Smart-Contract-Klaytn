const jwt = require("jsonwebtoken");

async function getUsername(auth) {
    try {
        return jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET)["name"];
    }
    catch (e) {
        return false;
    }
}

module.exports = {
    getUsername: getUsername
}