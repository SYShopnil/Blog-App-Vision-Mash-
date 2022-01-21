const express = require('express');
const route = express.Router();
const  {
    loginController
} = require('./controller')

route.post ("/login", loginController)

module.exports = route