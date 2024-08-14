const Booking = require("../models/booking");
const Hotel = require("../models/hotel");
const User = require("../models/user");

module.exports.index = async (req, res) => {
	const bookings = await Booking.find({ author: req.user._id }).populate("author").populate("hotel").sort("from");
	let upcoming = false;
	let ongoing = false;
	let completed = false;
	bookings.forEach((booking) => {
		if (booking.status === "upcoming") upcoming = true;
		else if (booking.status === "completed") completed = true;
		else ongoing = true;
	});
	res.render("bookings/index", { bookings, upcoming, ongoing, completed });
};

module.exports.renderNewForm = async (req, res) => {
	const { id } = req.params;
	const hotel = await Hotel.findById(id);
	res.render("bookings/new", { hotel });
};

module.exports.createBooking = async (req, res) => {
	const booking = new Booking(req.body.booking);
	booking.author = req.user._id;
	booking.hotel = req.params.id;
	if (booking.from > Date.now()) booking.status = "upcoming";
	else if (booking.to < Date.now()) booking.status = "completed";
	else booking.status = "ongoing";
	await booking.save();
	const hotel = await Hotel.findById(req.params.id);
	req.user.bookings.push(hotel);
	await req.user.save();
	req.flash("success", "Successfully booked the rooms!");
	res.redirect(`/hotels/bookings`);
};

module.exports.renderEditForm = async (req, res) => {
	const { id, bid } = req.params;
	const hotel = await Hotel.findById(id);
	const booking = await Booking.findById(bid);
	if (!booking) {
		req.flash("error", "Cannot find that booking!");
		return res.redirect("/bookings");
	}
	res.render("bookings/edit", { booking, hotel });
};

module.exports.updateBooking = async (req, res) => {
	const { id, bid } = req.params;
	const booking = await Booking.findOneAndUpdate({ _id: bid }, { ...req.body.booking });
	if (booking.from > Date.now()) booking.status = "upcoming";
	else if (booking.to < Date.now()) booking.status = "completed";
	else booking.status = "ongoing";
	await booking.save();
	req.flash("success", "Successfully updated the booking!");
	res.redirect("/hotels/bookings");
};

module.exports.cancelBooking = async (req, res) => {
	const { bid } = req.params;
	await Booking.findById(bid).deleteMany();
	await User.updateMany({ _id: req.user._id }, { $pull: { bookings: bid } });
	req.flash("success", "Successfully cancelled the booking!");
	res.redirect(`/hotels/bookings`);
};
