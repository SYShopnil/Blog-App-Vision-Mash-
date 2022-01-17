const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config()
const gqlHeader = require('express-graphql-header')
const adminGql = require('./src/gql/Admin/graphql')

//env file
const url = process.env.SERVER_URL || 8080
const mongoUrl = process.env.MONGO_URL

//parser and others middleware part
app.use (express.json({limit: "250mb"}))
app.use (express.urlencoded({extended: true, limit: "250mb"}))
app.use (express.static("public"))

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

//all graphql api
app.use ("/admin", gqlHeader, adminGql)

//page not found route
app.get ("*", (req, res) => {
    res.send (`404 Page not found`)
})