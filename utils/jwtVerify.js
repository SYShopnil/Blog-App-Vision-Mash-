const jwt = require('jsonwebtoken');

const jwtVerifier = async (token) => {
    const isVerify = jwt.verify (token, process.env.JWT_CODE) 
    return {
        isVerify
    }
}

module.exports = jwtVerifier