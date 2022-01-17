const mongoose = require('mongoose');
const Schema = mongoose.Schema

const contactSchema = new Schema ({
    email: String,
    subject: String,
    isRead: {
        type: Boolean,
        default: false
    },
    message: String
})

module.exports = mongoose.model ("Contact", contactSchema)