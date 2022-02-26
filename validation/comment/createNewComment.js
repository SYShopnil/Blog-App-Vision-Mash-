const Joi = require ('joi')

const mainValidation = Joi.object ({
    content: Joi.string().required(),
    blog: Joi.string().required()
})

module.exports = mainValidation