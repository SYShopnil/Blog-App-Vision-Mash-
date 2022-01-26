const Joi = require ('joi')

const mainValidation = Joi.object ({
    newPassword: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')),
    retypePassword: Joi.ref ("newPassword")
})

module.exports = mainValidation