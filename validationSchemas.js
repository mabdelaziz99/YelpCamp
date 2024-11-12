const Joi = require('joi')

// Server-side (Joi) validation that works alonside the client-side validation

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.string().required(),
    location: Joi.string().required(),
    description: Joi.string().required()
}).required()
})
