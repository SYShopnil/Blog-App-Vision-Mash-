const {graphqlHTTP} = require ("express-graphql")
const rootValue = require("./resolver")
const schema = require("./schema")

const gql = graphqlHTTP ({
    schema,
    rootValue,
    graphiql : true    
})


module.exports = gql