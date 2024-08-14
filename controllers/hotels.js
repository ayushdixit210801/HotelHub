const Hotel = require("../models/hotel");
const Booking = require("../models/booking");
const cloudinary = require("cloudinary");
const maptilerClient = require("@maptiler/client");
const moment = require("moment");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
	let hotels;
	let totalDocs;
	const search = req.query.search || "";
	let sortby = req.query.sort || "-dateEdited";
	const perPage = 9;
	const pageNumber = req.query.pageNumber || 1;
	const allHotels = await Hotel.find({});

	if (!search) {
		totalDocs = await Hotel.countDocuments({});
	}
	if (search) {
		hotels = await Hotel.find({
			$or: [
				{
					title: new RegExp(`(\w*)${search}(\w*)`, "i"),
				},
				{ location: new RegExp(`(\w*)${search}(\w*)`, "i") },
			],
		})
			.sort(sortby)
			.skip(perPage * (pageNumber - 1))
			.limit(perPage);
		totalDocs = await Hotel.countDocuments({
			$or: [
				{
					title: new RegExp(`(\w*)${search}(\w*)`, "i"),
				},
				{ location: new RegExp(`(\w*)${search}(\w*)`, "i") },
			],
		});
	} else {
		hotels = await Hotel.find({})
			.sort(sortby)
			.skip(perPage * (pageNumber - 1))
			.limit(perPage);
	}

	let totalPages = totalDocs / perPage;

	if (totalPages % 1 !== 0) {
		totalPages = Math.floor(totalPages) + 1;
	}

	res.render("hotels/index", {
		allHotels,
		hotels,
		searchTerm: search,
		totalDocs,
		sortby,
		totalPages,
		currentPage: pageNumber,
	});
};

module.exports.renderNewForm = (req, res) => {
	res.render("hotels/new");
};

module.exports.createHotel = async (req, res) => {
	const geoData = await maptilerClient.geocoding.forward(req.body.hotel.location, { limit: 1 });
	if (!geoData.features.length) {
		req.flash("error", "Invalid location, please try again!");
		return res.redirect("/hotels/new");
	}
	const hotel = new Hotel(req.body.hotel);
	hotel.geometry = geoData.features[0].geometry;
	hotel.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
	hotel.author = req.user._id;
	hotel.dateCreated = moment().format("MMMM Do YYYY");
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
	const { id } = req.params;
	const geoData = await maptilerClient.geocoding.forward(req.body.hotel.location, { limit: 1 });
	if (!geoData.features.length) {
		req.flash("error", "Invalid location, please try again!");
		return res.redirect(`/hotels/${id}/edit`);
	}
	const hotel = await Hotel.findByIdAndUpdate(id, { ...req.body.hotel });
	hotel.geometry = geoData.features[0].geometry;
	const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
	hotel.images.push(...imgs);
	hotel.editDate = moment().format("MMMM Do YYYY");
	await hotel.save();
	if (req.body.deleteImages) {
		for (let id of req.body.deleteImages) {
			const img = hotel.images.find((i) => i._id == id);
			if (img.isDefault === false) {
				await cloudinary.uploader.destroy(img.filename);
			}
			await hotel.updateOne({ $pull: { images: { filename: { $in: img.filename } } } });
		}
	}
	req.flash("success", "Successfully updated hotel!");
	res.redirect(`/hotels/${id}`);
};

module.exports.deleteHotel = async (req, res) => {
	const { id } = req.params;
	const hotel = await Hotel.findById(id);
	for (let img of hotel.images) {
		if (!img.isDefault) {
			await cloudinary.uploader.destroy(img.filename);
		}
	}
	await Booking.deleteMany({ hotel: id });
	await Hotel.findByIdAndDelete(id);
	req.flash("success", "Successfully deleted hotel");
	res.redirect("/hotels");
};
