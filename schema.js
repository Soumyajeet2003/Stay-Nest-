const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    //listing : Joi.object({
        title : Joi.string().required(),
        description : Joi.string().required(),
        location : Joi.string().required(),
        country : Joi.string().required(),
        price : Joi.number().required().min(0),
        image: Joi.array().items(
                    Joi.object({
                        url: Joi.string().uri().allow("", null),
                        filename: Joi.string()
                                    .empty('')    // treats empty string as missing
                                    .default('default_image')
                    })
                ).optional()
    //}).optional(),
});

module.exports.reviewSchema = Joi.object({
    review : Joi.object({
        rating : Joi.number().required().min(1).max(5),
        comment : Joi.string().required(),
    }).required(),
});
