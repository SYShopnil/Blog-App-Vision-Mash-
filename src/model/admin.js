const mongoose = require('mongoose');
const Schema = mongoose.Schema

const adminSchema = new Schema ({
    slug : String,
    personalInfo : {
        firstName: String,
        lastName: String,
        email: String
    },
    userId: String,
    password: String,
    isDelete: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model ("Admin", adminSchema)