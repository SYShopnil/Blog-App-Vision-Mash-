const Joi  = require('joi');

const logoValidation = Joi.object ({
    base64: Joi.string(),
    size: Joi.number ()
})
const availableSocialMediaValidation = Joi.object ({ 
    siteName: Joi.string().required(),
    link: Joi.string ().required()
})

const availableMainCategoryValidation = Joi.object ({
  name: Joi.string ().required(),
  color: Joi.string ().required()  
})

const mainValidation = Joi.object ({
    email: Joi.string ().required(),
    companyName: Joi.string ().required(),
    logo: logoValidation,
    address: Joi.string ().required(),
    phone: Joi.string().required (),
    availableSocialMedia: Joi.array().items (availableSocialMediaValidation).required(),
    availableMainCategory: Joi.array ().items (availableMainCategoryValidation).required(),
    availableSubCategory: Joi.array ().items (Joi.string()).required ()
} )

module.exports = mainValidation