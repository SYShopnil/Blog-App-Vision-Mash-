const mongoose = require('mongoose');
const Schema = mongoose.Schema

const adminSchema = new Schema ({
    slug : String,
    personalInfo : {
        firstName: String,
        lastName: String,
        email: String,
        contactNumber: String
    },
    userType: {
        type: String,
        enum : ["admin"],
        default: "admin"
    },
    otp: {
        type: String,
        default: ""
    },
    userId: String,
    password: String,
    isDelete: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
})

module.exports = mongoose.model ("Admin", adminSchema)