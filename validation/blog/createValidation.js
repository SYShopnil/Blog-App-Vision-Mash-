const Joi = require('joi');

const imageValidation = Joi.object ({
    base64: Joi.string(),
    size: Joi.number()
})

const mainValidation = Joi.object ({
    title: Joi.string().required (),
    mainCategory: Joi.string().required(),
    subCategory: Joi.array().items (Joi.string()),
    keyWord: Joi.array ().items(Joi.string()),
    content: Joi.string().required(),
    coverPic: imageValidation,
    titlePic: imageValidation
})

module.exports = mainValidation

