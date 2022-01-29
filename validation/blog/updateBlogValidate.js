const Joi = require('joi');


const updateBlogDuringSaveValidation = Joi.object ({
    blogId: Joi.string().required(),
    content: Joi.string().required(),
})

module.exports = {
    updateBlogDuringSaveValidation
}