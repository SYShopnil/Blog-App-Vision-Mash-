const mongoose = require('mongoose');
const Schema = mongoose.Schema

const commentSchema = new Schema ({
    content: String,
    commentId: {
        type: String,
        unique: true
    },
    parent: {
        type: String,
        default: ""
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "Client"
    },
    blog: {
        type: Schema.Types.ObjectId,
        ref: "Blog"
    }
},
{
    timestamps: true
})

module.exports = mongoose.model ("Comment", commentSchema)