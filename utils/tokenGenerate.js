const jwt = require ("jsonwebtoken")
const securityCode = process.env.JWT_CODE

const tokenGenerator = async (data, exp) => {
    const expiresIn = exp || `${process.env.TOKEN_EXPIRE}d`
    token =  jwt.sign  (data, securityCode, {expiresIn}) //generate a new code
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