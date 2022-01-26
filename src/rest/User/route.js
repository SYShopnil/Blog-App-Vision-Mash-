const express = require('express');
const route = express.Router();
const auth =  require('../../../middleware/rest/auth');
const authorization =  require('../../../middleware/rest/authorization');
const  {
    loginController,
    seeHisProfileController,
    confirmLoggedInUserPasswordController:confirmPasswordController,
    updateLoggedInUserPassword,
    forgotPasswordPartOneController
} = require('./controller')

//post
route.post ("/login", loginController)
route.post ("/verify/password", auth, authorization ("admin", "client"),  confirmPasswordController)
route.post ("/forgot/password", forgotPasswordPartOneController)

//put
route.put ("/update/password", auth, authorization ("admin", "client"),  updateLoggedInUserPassword)

//get
route.get ("/profile", auth, seeHisProfileController)

module.exports = route