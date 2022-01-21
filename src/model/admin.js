const mongoose = require('mongoose');
const Schema = mongoose.Schema

const adminSchema = new Schema ({
    slug : String,
    personalInfo : {
        firstName: String,
        lastName: String,
        email: String
    },
    userType: {
        type: String,
        enum : ["admin"],
        default: "admin"
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