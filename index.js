const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config()
const cookieParser = require('cookie-parser')
const gqlHeader = require('express-graphql-header')
const cors = require ("cors");


//rest
const clientRest = require('./src/rest/Client/route')
const userRest = require('./src/rest/User/route')
const commentRest = require('./src/rest/Comment/route')
const adminRest = require('./src/rest/Comment/route')

//gql 
const adminGql = require('./src/gql/Admin/graphql')
const clientGql = require('./src/gql/Client/graphql')
const userGql = require('./src/gql/User/graphql')
const authGql = require('./middleware/gql/authentication')
const blogGql = require('./src/gql/Blog/graphql')
const officialGql = require('./src/gql/Official/graphql')
const commentGql = require('./src/gql/Comment/graphql')
const contactGql = require('./src/gql/Contact/graphql')

//env file
const url = process.env.SERVER_URL || 8080
const mongoUrl = process.env.MONGO_URL

//parser and others middleware part
app.use (express.json({limit: "250mb"}))
app.use (express.urlencoded({extended: true, limit: "250mb"}))
app.use (express.static("public"))
app.use(cookieParser())
app.use (cors())

//connect to the database
mongoose.connect (mongoUrl, {
    useUnifiedTopology: true,
})
.then (() => console.log(`Server is connected to the database`))
.catch (err => console.log(err))



//create a server instance
app.listen (url, () => console.log(`Server is running on ${url}`))

//base route
app.get ("/", (req, res) => {
    res.send (`I am from root`)
})

//all rest api
app.use ("/client", clientRest)
app.use ("/user", userRest)
app.use ("/comment", commentRest)
app.use ("/adm", adminRest)
//all graphql api
app.use(authGql)

app.use ("/admin", gqlHeader, adminGql)
app.use("/client", gqlHeader, clientGql)
app.use("/user", gqlHeader, userGql)
app.use("/blog", gqlHeader, blogGql)
app.use ("/official", gqlHeader, officialGql)
app.use ("/comment", gqlHeader, commentGql)
app.use ("/contact", gqlHeader, contactGql)


//page not found route
app.get ("*", (req, res) => {
    res.send (`404 Page not found`)
})

