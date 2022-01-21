const jwt = require ("jsonwebtoken")
const securityCode = process.env.JWT_CODE

const tokenGenerator = async (data) => {
    token =  jwt.sign  (data, securityCode, {expiresIn: `${process.env.TOKEN_EXPIRE}d` }) //generate a new code
    if (token) {
        return {
            token,
            isCreate: true
        }
    }else {
        return {
            token,
            isCreate: false
        }
    }
}

module.exports = tokenGenerator