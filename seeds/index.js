const mongoose = require("mongoose");
const Hotel = require("../models/hotel");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

mongoose.connect("mongodb://localhost:27017/HotelHub");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
	console.log("Database connected");
});

const seedDB = async () => {
	await Hotel.deleteMany({});
	for (let i = 0; i < 50; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;
		const hotel = new Hotel({
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${descriptors[Math.floor(Math.random() * descriptors.length)]} ${
				places[Math.floor(Math.random() * places.length)]
			} Hotel`,
			price: price,
			description:
				"Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi, quos.",
		});
		await hotel.save();
	}
};

seedDB().then(() => {
	db.close();
});
