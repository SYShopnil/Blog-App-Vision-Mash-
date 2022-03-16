const express = require('express');
const {
    helloController
} = require('./controller')
const route = express.Router();

route.get ("/hello",helloController)

module.exports = route