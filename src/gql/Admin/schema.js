const {buildSchema} = require("graphql")

const Admin = `
    type PersonalInfo {
        firstName: String
        lastName: String
        email: String
        contactNumber: String
    }
    type Admin {
        _id: ID
        slug: String
        personalInfo: PersonalInfo
        userId : String
        password: String
        isDelete: Boolean
    }
`
const inputField = `
    input inputDataOfAdmin {
        firstName: String!
        lastName: String!
        email: String!
        password: String!
        retypePassword: String!
        contactNumber: String!
    }
`
const mainSchema = buildSchema (`
    ${Admin}
    ${inputField}
    type responseOfCreateAdmin {
        message: String
        data: Admin
        status: Int
    }
    type Query {
        admin: responseOfCreateAdmin
    }
    type Mutation  {
        createAdmin (input: inputDataOfAdmin) : responseOfCreateAdmin
    }
`)

module.exports = mainSchema