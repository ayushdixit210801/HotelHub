const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
	author: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
	hotel: {
		type: Schema.Types.ObjectId,
		ref: "Hotel",
	},
	from: {
		type: Date,
		required: true,
	},
	to: {
		type: Date,
		required: true,
	},
	rooms: {
		type: Number,
		required: true,
	},
	status: {
		type: String,
		enum: ["upcoming", "ongoing", "completed"],
		default: "upcoming",
	},
});

bookingSchema.virtual("totalPrice").get(function () {
	return this.rooms * this.hotel.price * Math.ceil((this.to - this.from + 1) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model("Booking", bookingSchema);
