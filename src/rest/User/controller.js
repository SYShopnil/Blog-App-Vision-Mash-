const loginInputValidation = require('../../../validation/user/loginValidation')
const User = require('../../model/user')
const Admin = require('../../model/admin')
const bcrypt = require("bcrypt")
const tokenGenerator = require ("../../../utils/tokenGenerate")
const Client = require('../../model/client')
const passwordValidation = require("../../../validation/user/passwordValidation")
const emailValidation = require("../../../validation/user/emailValidation")
const otpGenerator = require("../../../utils/otpGenerator")
const {verificationsOtpDigit:otpDigit} = require("../../../assert/doc/global")
const sendOtp = require("../../../utils/sendMessageToNumber")
const sendMailer = require("../../../utils/sentMail")
const jwt = require ("jsonwebtoken")
const jwtSecurityCode = process.env.JWT_CODE
const OTPVerification = require("../../../utils/otpVerification")
const jwtVerifier = require("../../../utils/jwtVerify")
const req = require('express/lib/request')
const cookieOption = require ("../../../utils/cookieOption")

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

//user can see his profile  
const seeHisProfileController = async (req, res) => {
    try {
        const {user} = req //get the logged in user
        res.status (202).json ({
            message: "User found",
            user
        })
    }catch (err) {
        console.log(err);
        res.json ({
            message: err.message
        })
    }
}

//confirm logged in user password 
const confirmLoggedInUserPasswordController = async (req, res) => {
    try {
        const {user} = req //get the logged in user 
        const {password } = req.body //get the rewrite password from body 
        const {slug, userType} = user  //get the logged in user slug and userType 
        let dataBasePassword 
        if (userType == "admin") {
            const findAdmin = await Admin.findOne ({ //find the admin's password
                slug,
                isDelete: false
            }).select ("password")
            if (findAdmin) {
                const {password} = findAdmin
                dataBasePassword = password
            }else {
                res.json ({
                    message: "User not found",
                    status: false
                })
            }
        }else if (userType == "client") { // if the user is a client then it will execute
            const findClient = await Client.findOne ({ //find the client's password
                slug,
                "othersInfo.isDelete": false
            }).select ("password")
            if (findClient) { 
                const {password} = findClient
                dataBasePassword = password
            }else {
                res.json ({
                    message: "User not found",
                    status: false
                })
            }
        }
        if (dataBasePassword) { //if database password has been found then it will happen
            const dbPassword = dataBasePassword 
            const inputPassword = password
            const isMatch = await bcrypt.compare (inputPassword, dbPassword) //check that is it match or not 
            if (isMatch) { //if input password and logged in user password has matched then it will happen
                res.status (202).json ({
                    message: "Password matched",
                    status: true
                })
            }else {
                res.json ({
                    message: "Password mismatch",
                    status: false
                })
            }
        }else {
            res.json ({
                message: "Database password not found",
                status: false
            })
        }
    }catch (err) {
        console.log(err);
        res.json ({
            message: err.message,
            status: false
        })
    }
}

//update logged in user password 
const updateLoggedInUserPassword = async (req, res) => {
    try {
        const {error} = passwordValidation.validate(req.body) // validate the body 
        if (error) { //if validation failed
            res.json ({
                message: error.message
            })
        }
        const {
            newPassword:password
        } = req.body

        const hashedPassword = await bcrypt.hash (password, 10) //hashed the password 
        if (hashedPassword) { //if password hashed successfully
            const {slug, userType} = req.user
            let isUpdate = false
            if (userType == "admin") { //if user type is admin then it will happen
                const updatePassword = await Admin.updateOne (
                    {
                        slug,
                        "isDelete": false
                    },
                    {
                        $set: {
                            "password": hashedPassword
                        }
                    }
                ) //update the logged in admin's password
                if (updatePassword.modifiedCount != 0) {
                    isUpdate = true
                }
            }else if (userType == "client") {
                const updatePassword = await Client.updateOne (
                    {
                        slug,
                        "othersInfo.isDelete": false
                    },
                    {
                        $set: {
                            "password": hashedPassword
                        }
                    }
                ) //update the logged in admin's password
                if (updatePassword.modifiedCount != 0) {
                    isUpdate = true
                }
            }
            if (isUpdate) {
                res.status (202).json ({
                    message: "Password updated successfully"
                })
            }else {
                res.json ({
                    message: "Password update failed"
                })
            }
        }else {
            res.json ({
                message: "Password hashing problem"
            })
        }
    }catch (err) {
        console.log(err);
        res.json ({
            message: err.message,
        })
    }
}

//forgot password part 1 give the otp with token 
const forgotPasswordPartOneController = async (req, res) => {
    try {
        const {error} = emailValidation.validate (req.body) //validate the 
        const {verifyToken:verifyToken} = req.cookies
        if (error) {
            res.json ({
                message: error.message
            })
        }
        let email
        let method
        if (!verifyToken) { //if token is not available in the cookies 
            const {
                email:bodyEmail,
                verifyBy
            } = req.body
            email = bodyEmail,
            method = verifyBy
        }else {
            const {
                verifyBy
            } = req.body
            method = verifyBy
            const {email:tokeEmail} = jwt.verify (verifyToken, process.env.JWT_CODE)
            email = tokeEmail
        }
        
        
        const findUser = await User.findOne ({email}).select ("userType") //get the user 
        // console.log(email);
        if (findUser) { //if user hs found then it will happen
            const {userType} = findUser
            const tokenData = {
                userType,
                email
            }
            let number = ""
            const newOTP = otpGenerator (otpDigit) //generate 4 digit otp
            if (userType == "admin") { //for admin this service is not wording right now
                const findAdmin = await Admin.findOne ( //find the admin
                    {
                        "personalInfo.email": email,
                        isDelete: false
                    }
                ).select (
                    `
                        slug
                        userId
                        personalInfo.contactNumber
                    `
                )
                if (findAdmin) { //if admin found 
                    const {slug, userId, personalInfo:{contactNumber}} = findAdmin
                    tokenData.slug = slug
                    tokenData.userId = userId
                    number = contactNumber
                    // console.log(findAdmin.personalInfo.contactNumber);
                    const updateOtp = await Admin.updateOne (
                        {
                            slug,
                            userId
                        },
                        {
                            $set: {
                                otp: newOTP
                            }
                        }
                    )
                    if (updateOtp.modifiedCount == 0 ) {
                        res.json ({
                            message: "OTP not save"
                        })
                    }
                }else {
                    res.json ({
                        message: "User not found"
                    })
                }
            }else if (userType == "client") {
                const findClient = await Client.findOne ( //find the admin
                    {
                        "personalInfo.email": email,
                        "othersInfo.isDelete": false
                    }
                ).select (
                    `
                        slug
                        clientId
                        personalInfo.contactNumber
                    `
                )
                if (findClient) { //if admin found 
                    const {slug, clientId:userId, personalInfo:{contactNumber}} = findClient
                    tokenData.slug = slug
                    tokenData.userId = userId
                    number = contactNumber
                    const updateOtp = await Client.updateOne (
                        {
                            slug,
                            userId
                        },
                        {
                            $set: {
                                otp: newOTP
                            }
                        }
                    )
                    if (updateOtp.modifiedCount == 0 ) {
                        res.json ({
                            message: "OTP not save"
                        })
                    }
                }else {
                    res.json ({
                        message: "User not found"
                    })
                }
            }
            const {token:newToken, isCreate:isTokenCreate } = await tokenGenerator (tokenData, process.env.PASSWORD_RESET_TOKEN_TIME)
            if (newOTP) {
                if (isTokenCreate) {
                    const token = newToken //create new token it contains userType, email, slug and userId
                    const OTP = newOTP //create new otp 
                    const sendNumber = number //this number we have to sent otp
                    const senderEmail = email //this email we have to sent otp
                    let responseMessage = "" //this response message will sent into client site
                    const message = `Your One time Password is ${OTP}`
                    if (method == "email") { //if user check email to verify 
                        const {responseStatus} = await sendMailer ("", senderEmail, message, "OTP")
                        if (responseStatus) { //if email successfully sent then it will happen
                            responseMessage =  `A ${otpDigit} digit otp has been sent to ${senderEmail}`
                        }else {
                            res.json ({
                                message: "Email send failed"
                            })
                        }
                    }else if (method == "number") { //if user check number to verify 
                        const {status:otpSentStatus} = await sendOtp (sendNumber, message) //sent the mail
                        if (otpSentStatus) {
                            responseMessage = `A ${otpDigit} digit otp has been sent to ${sendNumber}`
                        }else {
                            res.json ({
                                message: "OTP message not send"
                            })
                        }
                    }
                    if (responseMessage) {
                        // cookie options
                        const options = cookieOption (process.env.PASSWORD_RESET_COOKIE_TIME || 1)
                        res.cookie (process.env.FORGOT_PASSWORD_USER_COOKIE_NAME, token, options).status (202).json ({
                            message: responseMessage
                        })
                    }else {
                        res.json ({
                            message: "Somethings went wrong"
                        })
                    }
                }
            }else {
                res.json ({
                    message: "Otp creation failed"
                })
            }


        }else {
            res.json ({
                message: "User not found try with another email"
            })
        }
    }catch (err) {
        console.log(err);
        res.status({
            message: err.message
        })
    }
}

//forgot password part 2 take the otp and verify it 
const verifyTheForgotPasswordOTPController = async (req, res) => {
    try {
        const {otp:inputOTP} = req.body //get the input otp
        if (inputOTP.length == 4) { //if otp found then it will happen
            const {verifyToken} = req.cookies
            const {email, slug, userType} = await jwt.verify (verifyToken, jwtSecurityCode)
            const {isMatch} = await  OTPVerification (email, slug, userType, inputOTP)
            if (isMatch) { //if otp match with database otp then it will happen
                res.status(202).json ({
                    message: "OTP successful verified",
                    isVerified: true
                })
            }else {
                res.json ({
                    message: "OTP not verified please put a valid one",
                    isVerified: false
                })
            }
            
        }else {
            res.json ({
                message: "OTP required or not valid"
            })
        }
    }catch (err) {
        res.json ({
            message: err.message
        })
    }
}

//forgot password part 3 after verify the otp it will take the new password and update it.
const resetPasswordController = async (req, res) => {
    try {
        const {error} = passwordValidation.validate (req.body) //password validation part 
        if (error) {
            res.json ({
                message: error.message
            })
        }
        const {newPassword} = req.body //get the data from body
        const {verifyToken} = req.cookies //get the token from cookies
        const {isVerify:{email, slug, userId,userType}} = await jwtVerifier (verifyToken)
        const hashedPassword = await bcrypt.hash (newPassword, 10)
        if (hashedPassword) { //if password is hashed then it will happen
            let isPasswordChange = false //it will track that is password have changed or not
            if (userType == "admin") { //if user type is admin
                const updateAdmin = await Admin.updateOne ( //update the admin data and update the password
                    {
                        userType,
                        "personalInfo.email": email,
                        slug,
                        userId
                    },
                    {
                        $set: {
                            password: hashedPassword
                        }
                    },
                    {
                        multi: true
                    }
                )
                if (updateAdmin.modifiedCount != 0 ) { //if admin is modified then it will happen
                    isPasswordChange = true
                }else {
                    isPasswordChange = false
                }
            }else if (userType == "client") { //if user type is client
                const updateClient = await Client.updateOne ( //update the client data and update the password
                    {
                        userType,
                        "personalInfo.email": email,
                        slug,
                        clientId
                    },
                    {
                        $set: {
                            password: hashedPassword
                        }
                    },
                    {
                        multi: true
                    }
                )
                if (updateClient.modifiedCount != 0 ) { //if client is modified then it will happen
                    isPasswordChange = true
                }else {
                    isPasswordChange = false
                }
            }
            if (isPasswordChange) { //if the password is change then it will sent a positive response
                res.clearCookie (process.env.FORGOT_PASSWORD_USER_COOKIE_NAME).status(202).json ({
                    message: "Password has changed successfully"
                })
            }else {
                res.json ({
                    message: "Password change failed"
                })
            }
        }else {
            res.json ({
                message: "Password hashing problem"
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
    loginController,
    seeHisProfileController,
    confirmLoggedInUserPasswordController,
    updateLoggedInUserPassword,
    forgotPasswordPartOneController,
    verifyTheForgotPasswordOTPController,
    resetPasswordController
}
