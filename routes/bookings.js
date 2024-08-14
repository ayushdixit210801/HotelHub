const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, validateBooking } = require("../middleware");
const bookings = require("../controllers/bookings");

router.route("/").get(isLoggedIn, catchAsync(bookings.index));

router.get("/:id/new", isLoggedIn, bookings.renderNewForm);

router.post("/:id", isLoggedIn, validateBooking, bookings.createBooking);

router.delete("/:id/:bid", isLoggedIn, bookings.cancelBooking);

router.get("/:id/:bid/edit", isLoggedIn, bookings.renderEditForm);

router.put("/:id/:bid", isLoggedIn, validateBooking, bookings.updateBooking);

module.exports = router;
