const express = require('express');
const route = express.Router();
const auth = require('../../../middleware/rest/auth');
const authorization = require('../../../middleware/rest/authorization');
const  {
    seeOnlyHisActivityByYear
} = require('./controller')

route.get ("/activity", auth, authorization("client"), seeOnlyHisActivityByYear)

module.exports = route
