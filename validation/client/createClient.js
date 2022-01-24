const Joi = require ('joi')

const SocialMediaValidation = Joi.object ({
    name: Joi.string(), 
    link: Joi.string ()
})



const mainValidation = Joi.object ({
    firstName: Joi.string ().required (),
    lastName: Joi.string().required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')),
    retypePassword: Joi.ref ("password"),
    contactNumber: Joi.string().required() ,
    gender: Joi.string().required(), 
    district: Joi.string().required(),
    division: Joi.string().required() ,
    country: Joi.string().required() ,
    socialMedia: Joi.array().items (SocialMediaValidation)
})

module.exports = mainValidation