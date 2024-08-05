const Hotel = require("../models/hotel");

module.exports.index = async (req, res) => {
	const hotels = await Hotel.find({});
	res.render("hotels/index", { hotels });
};

module.exports.renderNewForm = (req, res) => {
	res.render("hotels/new");
};

module.exports.createHotel = async (req, res) => {
	const hotel = new Hotel(req.body.hotel);
	hotel.author = req.user._id;
	await hotel.save();
	req.flash("success", "Successfully made a new hotel!");
	res.redirect(`/hotels/${hotel._id}`);
};

module.exports.showHotel = async (req, res) => {
	const { id } = req.params;
	const hotel = await Hotel.findById(id)
		.populate({ path: "reviews", populate: { path: "author" } })
		.populate("author");
	if (!hotel) {
		req.flash("error", "Cannot find that hotel!");
		return res.redirect("/hotels");
	}
	res.render("hotels/show", { hotel });
};

module.exports.renderEditForm = async (req, res) => {
	const { id } = req.params;
	const hotel = await Hotel.findById(id);
	if (!hotel) {
		req.flash("error", "Cannot find that hotel!");
		return res.redirect("/hotels");
	}
	res.render("hotels/edit", { hotel });
};

module.exports.updateHotel = async (req, res) => {
	const hotel = req.body.hotel;
	const { id } = req.params;
	await Hotel.findByIdAndUpdate(id, hotel);
	req.flash("success", "Successfully updated hotel!");
	res.redirect(`/hotels/${id}`);
};

module.exports.deleteHotel = async (req, res) => {
	const { id } = req.params;
	await Hotel.findByIdAndDelete(id);
	req.flash("success", "Successfully deleted hotel");
	res.redirect("/hotels");
};
