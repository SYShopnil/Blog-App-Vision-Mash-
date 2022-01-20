const Joi = require ('joi')

const mainValidation = Joi.object ({
    firstName: Joi.string ().required (),
    lastName: Joi.string().required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')),
    retypePassword: Joi.ref ("password")
})

module.exports = mainValidation