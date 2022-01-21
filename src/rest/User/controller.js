const loginInputValidation = require('../../../validation/user/loginValidation')
const User = require('../../model/user')
const Admin = require('../../model/admin')
const bcrypt = require("bcrypt")
const tokenGenerator = require ("../../../utils/tokenGenerate")
const Client = require('../../model/client')

//login controller 
const loginController = async (req, res) => {
    try {
        const {error} = loginInputValidation.validate(req.body) // validate the input data 
        if (error) {
            res.json ({
                message: error.message
            })
        }
        const {email,password} = req.body //get the email and password from the body 
        
        // cookie options
        const options = {
            expires: new Date(
                Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
        };
        //check the mail address is available or not 
        const isAvailableEmail = await  User.findOne ({email}) //query by email 
        if (isAvailableEmail) { //if the user is not available 
            const {userType} = isAvailableEmail //get the user type  
            if (userType == "admin") { //if the user is an admin 
                const findUser = await Admin.findOne ({"personalInfo.email": email})//find that user 
                if (findUser) { //if the user found
                    const {password: dataBasePassword, userType, slug, userId } = findUser //get the user  Password
                    const inputPassword = password //get the input password 
                    const isPasswordMatch = await bcrypt.compare (inputPassword, dataBasePassword) //check that password is match or not  
                    if (isPasswordMatch) { //if password match then it will happen
                        const tokenData = {
                            userId,
                            userType,
                            slug
                        }
                        const {isCreate,  token} = await tokenGenerator (tokenData) //get the jwt token
                        if (isCreate) {
                            res.cookie ("auth", token, options).json ({
                                message: "Login successful",
                                token,
                                user: findUser
                            })
                        }else {
                            res.json ({
                                message: "Token Creation Error"
                            })
                        }
                    }else {
                        res.json ({
                            message: "Password does not match"
                        })
                    }
                }

            }else if (userType == "client") {
                const findUser = await Client.findOne ({"personalInfo.email": email})//find that user 
                if (findUser) { //if the user found
                    const {password: dataBasePassword, userType, slug, clientId:userId } = findUser //get the user  Password
                    const inputPassword = password //get the input password 
                    const isPasswordMatch = await bcrypt.compare (inputPassword, dataBasePassword) //check that password is match or not  
                    if (isPasswordMatch) { //if password match then it will happen
                        const tokenData = { //this will be my token data 
                            userId,
                            userType,
                            slug
                        }
                        const {isCreate,  token} = await tokenGenerator (tokenData) //get the jwt token
                        if (isCreate) {
                            res.cookie ("auth", token, options).json ({
                                message: "Login successful",
                                token,
                                user: findUser
                            })
                        }else {
                            res.json ({
                                message: "Token Creation Error"
                            })
                        }
                    }else {
                        res.json ({
                            message: "Password does not match"
                        })
                    }
                }
            }
        }else {
            res.json ({
                message: "User Not found"
            })
        }
    }catch (err) {
        console.log(err);
        res.json ({
            message: err.message
        })
    }
}

module.exports = {
    loginController
}
