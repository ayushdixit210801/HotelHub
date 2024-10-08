const mongoose = require("mongoose");
const review = require("./review");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
	url: String,
	filename: String,
	isDefault: {
		type: Boolean,
		default: false,
	},
});

ImageSchema.virtual("thumb").get(function () {
	return this.url.replace("/upload", "/upload/h_277,w_415");
});

ImageSchema.virtual("thumbnail").get(function () {
	return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true } };

const hotelSchema = new Schema(
	{
		title: String,
		images: [ImageSchema],
		geometry: {
			type: {
				type: String,
				enum: ["Point"],
				required: true,
			},
			coordinates: {
				type: [Number],
				required: true,
			},
		},
		price: Number,
		description: String,
		location: String,
		author: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		reviews: [
			{
				type: Schema.Types.ObjectId,
				ref: "Review",
			},
		],
		dateCreated: {
			type: String,
		},
		editDate: {
			type: String,
		},
		avg_rating: {
			type: Number,
			default: 0,
		},
	},
	opts
);

hotelSchema.virtual("properties.popUpMarkup").get(function () {
	return `
		<strong><a href="/hotels/${this._id}">${this.title}</a></strong>
		<br><strong>₹ ${this.price} / night</strong>
		<br>Rating : ${this.avg_rating}<br>Rewiews : ${this.reviews.length}
		`;
});

hotelSchema.post("findOneAndDelete", async function (doc) {
	if (doc) {
		await review.deleteMany({
			_id: {
				$in: doc.reviews,
			},
		});
	}
});

module.exports = mongoose.model("Hotel", hotelSchema);
