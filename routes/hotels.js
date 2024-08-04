const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Hotel = require("../models/hotel");
const { hotelSchema } = require("../schemas.js");
const { isLoggedIn } = require("../middleware");

const validateHotel = (req, res, next) => {
	const { error } = hotelSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

router.get(
	"/",
	catchAsync(async (req, res) => {
		const hotels = await Hotel.find({});
		res.render("hotels/index", { hotels });
	})
);
router.get("/new", isLoggedIn, (req, res) => {
	res.render("hotels/new");
});
router.post(
	"/",
	isLoggedIn,
	validateHotel,
	catchAsync(async (req, res) => {
		const hotel = new Hotel(req.body.hotel);
		await hotel.save();
		req.flash("success", "Successfully made a new hotel!");
		res.redirect(`/hotels/${hotel._id}`);
	})
);
router.get(
	"/:id",
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const hotel = await Hotel.findById(id).populate("reviews");
		if (!hotel) {
			req.flash("error", "Cannot find that hotel!");
			return res.redirect("/hotels");
		}
		res.render("hotels/show", { hotel });
	})
);
router.get(
	"/:id/edit",
	isLoggedIn,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const hotel = await Hotel.findById(id);
		if (!hotel) {
			req.flash("error", "Cannot find that hotel!");
			return res.redirect("/hotels");
		}
		res.render("hotels/edit", { hotel });
	})
);
router.put(
	"/:id",
	isLoggedIn,
	validateHotel,
	catchAsync(async (req, res) => {
		const hotel = req.body.hotel;
		const { id } = req.params;
		await Hotel.findByIdAndUpdate(id, hotel);
		req.flash("success", "Successfully updated hotel!");
		res.redirect(`/hotels/${id}`);
	})
);
router.delete(
	"/:id",
	isLoggedIn,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		await Hotel.findByIdAndDelete(id);
		req.flash("success", "Successfully deleted hotel");
		res.redirect("/hotels");
	})
);

module.exports = router;
