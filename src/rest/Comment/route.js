const {
    getAllCommentController
} = require('./controller')
const express = require("express")
const route = express.Router()

route.get ("/get/all/:id", getAllCommentController)


module.exports = route