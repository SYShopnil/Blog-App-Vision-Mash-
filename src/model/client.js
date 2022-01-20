const mongoose = require('mongoose');
const Schema = mongoose.Schema

const clientSchema = new Schema ({
    personalInfo: {
        firstName: String,
        lastName: String,
        email: {
            type: String,
            unique: true
        },
        contactNumber: String,
        profilePicture: String,
        coverPicture: String,
        gender: {
            type: String,
            enum: ["male", "female", "others"]
        },
        address: {
            district: String,
            division: String,
            country: String
        }
    },
    password: String,
    userType: {
        type: String,
        default: "client"
    },
    clientId: String,
    slug: String,
    otp: {
        type:String,
        default: ""
    },
    officialInfo: {
        blogInfo: {
            totalBlog: Number,
            allBlog : [
                {
                    type: Schema.Types.ObjectId,
                    ref: "Blog"
                }
            ]
        }
    },
    othersInfo : {
        isDelete: {
            type: Boolean,
            default: false
        },
        socialMedia: [
            {
                name: String,
                link: String
            }
        ]
    }
})

module.exports = mongoose.model ("Client", clientSchema)