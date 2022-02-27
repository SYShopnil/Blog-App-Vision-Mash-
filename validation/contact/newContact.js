const Joi = require('joi')

const mainValidation = Joi.object ({
    subject: Joi.string ().required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'bd'] } }).required(),
    message: Joi.string ().required()
})


module.exports = mainValidation