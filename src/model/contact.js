const mongoose = require('mongoose');
const Schema = mongoose.Schema

const contactSchema = new Schema ({
    email: String,
    subject: String,
    isRead: {
        type: Boolean,
        default: false
    },
    message: String,
    contactId: {
        type: String,
        unique: true
    },
    isDelete: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
})

module.exports = mongoose.model ("Contact", contactSchema)


