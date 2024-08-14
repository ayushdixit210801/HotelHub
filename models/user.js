const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
const booking = require("./booking");

const UserSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true,
	},
	bookings: [
		{
			type: Schema.Types.ObjectId,
			ref: "Booking",
		},
	],
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
