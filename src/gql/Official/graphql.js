const {graphqlHTTP} = require ("express-graphql")
const root = require("./resolver")
const schema = require("./schema")

const gql = graphqlHTTP ({
    rootValue: root,
    schema,
    graphiql: true
})


module.exports = gql;