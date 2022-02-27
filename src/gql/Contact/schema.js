const {buildSchema} = require ("graphql")

const contactSchema = `
    type Contact {
        email: String
        subject: String
        isRead: Boolean
        message : String
        createdAt: String
        updatedAt: String
        contactId: String
    }
`
const contactInput = `
    input newContactInput {
        subject: String!
        email: String!
        message: String!
    }
    input showAllContactInput {
        queryBy: String 
        sortBy: String
    }
`

const contactResponse = `
    type newContactResponse {
        message: String!
        status: Int!
        contact: Contact
    }
    type showAllContactResponse {
        message: String!
        status: Int!
        contact: [Contact]
    }
    type getIndividualContactResponse {
        message: String!
        status: Int!
        contact: Contact
    }
    type sendReplyResponse {
        message: String!
        status: Int!
    }
`

const common = `
    ${contactSchema}
    ${contactInput}
    ${contactResponse}
`

const mainSchema = buildSchema (`
    ${common}
    type Query {
        showAllContact (input: showAllContactInput ): showAllContactResponse
        showIndividualContact (contactId: String!): getIndividualContactResponse
    }
    type Mutation {
        createNewContact (input: newContactInput) : newContactResponse
        sendReply (contactId: String! reply: String!) : sendReplyResponse
    }
`)

module.exports = mainSchema


