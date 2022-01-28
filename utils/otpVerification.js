const Admin = require('../src/model/admin')
const Client = require('../src/model/client')

const OTPVerify = async (email, slug, userType, inputOTP) => {
    let dbOTP = "" //database otp
    if (userType == "admin") { //if this is a admin
        const findAdmin = await Admin.findOne ({ //find the admin from database
            slug,
            "personalInfo.email": email,
            isDelete: false
        }).select ("otp -_id")
        if (findAdmin) {
            dbOTP = findAdmin.otp
        }else {
            res.json ({
                message: "User not found"
            })
        }
    }else if (userType == "client") {
        const findAdmin = await Client.findOne ({ //find the admin from database
            slug,
            "personalInfo.email": email,
            isDelete: false
        }).select ("otp -_id")
        if (findAdmin) {
            dbOTP = findAdmin.otp
        }else {
            res.json ({
                message: "User not found"
            })
        }
    }
    if  (dbOTP == inputOTP) { //if database otp and input otp has matched 
        const isReset = deleteExistOTP (email, slug, userType)
        if (isReset) {
            console.log(`OTP delete from database`);
            return {
                isMatch: true
            }
        }else {
            return {
                isMatch: true
            }
        }
    }else {
        return {
            isMatch: false
        }
    }
}

const deleteExistOTP = async (email, slug, userType) => {
    let isOTPReset = false
    if (userType == "admin") {
        const resetOTP = await Admin.updateOne (
            {
                slug,
                "personalInfo.email": email,
                isDelete: false
            },
            {
                $set : {
                    "otp": ""
                }
            }
        )
        if (resetOTP.modifiedCount != 0) {
            isOTPReset = true
        }
    }else if (userType == "client") {
        const resetOTP = await Client.updateOne (
            {
                slug,
                "personalInfo.email": email,
                isDelete: false
            },
            {
                $set : {
                    "otp": ""
                }
            }
        )
        if (resetOTP.modifiedCount != 0) {
            isOTPReset = true
        }
    }
    return isOTPReset
}

module.exports = OTPVerify

