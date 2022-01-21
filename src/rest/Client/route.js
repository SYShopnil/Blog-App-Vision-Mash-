const express = require('express');
const route = express.Router();
const  {
    seeOnlyHisActivityByYear
} = require('./controller')

route.get ("/activity", seeOnlyHisActivityByYear)

module.exports = route