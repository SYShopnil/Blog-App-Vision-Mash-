const mongoose = require('mongoose');
const Schema = mongoose.Schema

const blogSchema = new Schema ({
    slug: String,
    isPublished: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    url: String,
    blogId: {
        type: String,
        unique: true
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "Client"
    },
    contentDetails: {
        title: String,
        mainCategory: String,
        subCategory: [String],
        keyword: [String],
        coverPic: String,
        titlePic: String,
        content: {
            published: String,
            draft: String
        }
    },
    viewersDetails: {
        totalView: {
            type: Number,
            default: 0
        },
        details: [
            {
                view: Number,
                month: String,
                year: String
            }
        ],
        userTrack : [
            {
                ipAddress: String,
                visitTime: Date
            }
        ]
    }
})

module.exports = mongoose.model ("Blog", blogSchema)