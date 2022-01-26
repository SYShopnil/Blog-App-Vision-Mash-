const {graphqlHTTP} = require("express-graphql")
const schema = require("./schema")
const rootValue = require("./resolver")

const gql = graphqlHTTP ({
    schema,
    rootValue,
    graphiql: true
}) 

module.exports = gql