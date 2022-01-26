const jwt  = require('jsonwebtoken')
require('dotenv').config()
const User = require('../../src/model/user')
const Admin = require('../../src/model/admin')
const Client = require('../../src/model/client')

const authenticationMiddleware = async (req, res, next) => {
    try {
        // const token = req.header('Authorization') //get the token from headers
        const {auth:token} = req.cookies //get the token from headers
        //get the dot env file data
        const securityCode = process.env.JWT_CODE //ge the security code from dot env
        if(!token) {
            res.json ({
                message: "Unauthorized user"
            })
        }else {
            const isValidToken = await jwt.verify(token, securityCode) //check that is it a valid token or not
            if(isValidToken) {
                const {userId, userType, slug } = isValidToken //store the token data as a verified userType
                const user = await User.findOne ({
                    userId,
                    userType
                }) // find the user
                if (user) { //if it is a valid user then it will execute
                    if (userType == "admin") {
                        const user = await Admin.findOne({slug, userId}).select ("-password -otp") //find logged in user 
                        if (user) { //if admin found then it will execute
                            req.user = user
                            next()
                        }else {
                            res.json ({
                                message: "Unauthorized user"
                            })
                        }
                    }else if (userType == "client") { //if user is client then it will execute
                        const user = await Client.findOne({slug, "clientId": userId}).select ("-password -otp") //find logged in user 
                        if (user) { //if client found then it will execute
                            req.user = user
                            next()
                        }else {
                            res.json ({
                                message: "Unauthorized user"
                            })
                        }
                    }
                }else {
                    res.json ({
                        message: "Unauthorized user"
                    })
                }
                
            }else {
                req.isAuth = false
                next ()
            }
        }
    }catch(err) {
        console.log(err);
        req.isAuth = false
        next ()
        console.log(err)
    }
}

module.exports = authenticationMiddleware

