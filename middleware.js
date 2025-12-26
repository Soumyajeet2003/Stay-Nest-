const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");


module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;  // Stores the path that a User try to access before login, to send the user to the same path
        req.flash("error", "You must be Logged in.");
        return res.render("users/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req,res,next) => {    // When we login , passport automataically resets the store dredirectUrl , so we have to store it into locals , because passport doesnot have the access of locals. And it becomes save.
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req,res,next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "You don't have that permission");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body.listing);
    if(error){
        let errorMsg = error.details.map(el => el.message).join(",");
        console.log(errorMsg);
        throw new ExpressError(400, errorMsg);
    }
    else{
        next();
    }
};

module.exports.validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errorMsg = error.details.map(el => el.message).join(",");
        console.log(errorMsg);
        throw new ExpressError(400, errorMsg);
    }
    else{
        next();
    }
};

module.exports.isReviewAuthor = async (req,res,next) => {
    let { id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error", "You don't have the permission to Delete this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}