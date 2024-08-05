const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const Hotel = require("../models/hotel");
const Review = require("../models/review");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

router.post(
	"/",
	isLoggedIn,
	validateReview,
	catchAsync(async (req, res) => {
		const hotel = await Hotel.findById(req.params.id);
		const review = new Review(req.body.review);
		review.author = req.user._id;
		hotel.reviews.push(review);
		await review.save();
		await hotel.save();
		req.flash("success", "Created new review!");
		res.redirect(`/hotels/${hotel._id}`);
	})
);
router.delete(
	"/:reviewId",
	isLoggedIn,
	isReviewAuthor,
	catchAsync(async (req, res) => {
		const { id, reviewId } = req.params;
		await Hotel.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
		await Review.findByIdAndDelete(reviewId);
		req.flash("success", "Successfully deleted review!");
		res.redirect(`/hotels/${id}`);
	})
);

module.exports = router;
