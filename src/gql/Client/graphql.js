const schema = require('./schema')
const root = require('./resolver')
const {graphqlHTTP} = require("express-graphql")

const gql = graphqlHTTP ({
    schema, 
    rootValue: root,
    graphiql: true
})

module.exports =  gql