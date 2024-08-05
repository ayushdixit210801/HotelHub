const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateHotel } = require("../middleware");
const hotels = require("../controllers/hotels");

router
	.route("/")
	.get(catchAsync(hotels.index))
	.post(isLoggedIn, validateHotel, catchAsync(hotels.createHotel));

router.get("/new", isLoggedIn, hotels.renderNewForm);

router
	.route("/:id")
	.get(catchAsync(hotels.showHotel))
	.put(isLoggedIn, isAuthor, validateHotel, catchAsync(hotels.updateHotel))
	.delete(isLoggedIn, isAuthor, catchAsync(hotels.deleteHotel));

router.get(
	"/:id/edit",
	isLoggedIn,
	isAuthor,
	catchAsync(hotels.renderEditForm)
);

module.exports = router;
