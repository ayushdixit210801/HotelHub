const Hotel = require("../models/hotel");
const Review = require("../models/review");
const moment = require("moment");

module.exports.createReview = async (req, res) => {
	const hotel = await Hotel.findById(req.params.id).populate("reviews");
	const review = new Review(req.body.review);
	review.author = req.user._id;
	hotel.reviews.push(review);
	await review.save();
	let avg = 0;
	if (hotel.reviews.length > 0) {
		for (let review of hotel.reviews) {
			avg = avg + review.rating;
		}
		avg = avg / hotel.reviews.length;
	}
	hotel.avg_rating = avg.toFixed(1);
	await hotel.save();
	req.flash("success", "Created new review!");
	res.redirect(`/hotels/${hotel._id}`);
};

module.exports.deleteReview = async (req, res) => {
	const { id, reviewId } = req.params;
	await Hotel.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
	await Review.findByIdAndDelete(reviewId);
	let avg = 0;
	const hotel = await Hotel.findById(id).populate("reviews");
	if (hotel.reviews.length > 0) {
		for (let review of hotel.reviews) {
			avg = avg + review.rating;
		}
		avg = avg / hotel.reviews.length;
	}
	hotel.avg_rating = avg.toFixed(1);
	await hotel.save();
	req.flash("success", "Successfully deleted review!");
	res.redirect(`/hotels/${id}`);
};
