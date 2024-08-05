const Hotel = require("../models/hotel");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
	const hotel = await Hotel.findById(req.params.id);
	const review = new Review(req.body.review);
	review.author = req.user._id;
	hotel.reviews.push(review);
	await review.save();
	await hotel.save();
	req.flash("success", "Created new review!");
	res.redirect(`/hotels/${hotel._id}`);
};

module.exports.deleteReview = async (req, res) => {
	const { id, reviewId } = req.params;
	await Hotel.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
	await Review.findByIdAndDelete(reviewId);
	req.flash("success", "Successfully deleted review!");
	res.redirect(`/hotels/${id}`);
};
