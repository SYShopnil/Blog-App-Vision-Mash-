const mongoose = require('mongoose');
const Schema = mongoose.Schema

const officialSchema = new Schema ({
    logo: String,
    companyName: String,
    controller : {
        navbarSelectCategory : [String],
        selectSocialMedia: [
            {
                siteName: String,
                link: String
            }
        ]
    },
    availableOption: {
        mainCategory: [
            {
                name: String,
                color: String
            }
        ],
        subCategory: [String],
        socialMedia : [
            {
                siteName: String,
                logo: String
            }
        ]
    },
    contactInfo: {
        email: {
            type: String,
            unique: true
        },
        phone: String,
        address: String
    }
},
{
    timestamps: true
})

module.exports = mongoose.model ("Official", officialSchema)