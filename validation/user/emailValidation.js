const Joi = require ('joi')

const mainValidation = Joi.object ({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    verifyBy : Joi.string().required()
})

module.exports = mainValidation