const {buildSchema} = require('graphql')

const inputField = `
    input imageUploadInput {
        base64: String
        size: Int
        uploadType: String!
    }
`

const mainSchema = buildSchema (
    `   
        ${inputField}
        type ResponseUploadImage {
            message: String
            status: Int
        }
        type Query {
            input: String
        }
        type Mutation {
            updateProfileImage (input: imageUploadInput): ResponseUploadImage
        }
    `
)

module.exports = mainSchema