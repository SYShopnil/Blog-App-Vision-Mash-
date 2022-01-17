const {buildSchema} = require("graphql")

const Admin = `
    type PersonalInfo {
        firstName: String
        lastName: String
        email: String
    }
    type Admin {
        _id: ID
        slug: String
        personalInfo: PersonalInfo
        userId : String
        password: String
        isDelete: String
    }
`
const mainSchema = buildSchema (`
    ${Admin}
    type Query {
        admins : [Admin]
        admin (slug: String): Admin
    }
`)

module.exports = mainSchema