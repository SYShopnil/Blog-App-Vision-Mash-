const Joi = require ('joi')

const mainValidation = Joi.object ({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'bd'] } }),
    verifyBy : Joi.string().required()
})

module.exports = mainValidation