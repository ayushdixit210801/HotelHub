const mongoose = require("mongoose");
const Hotel = require("../models/hotel");
const indianCities = require("./indianCities");
const defaultImages = require("./images");
const { places, descriptors } = require("./seedHelpers");

mongoose.connect("mongodb://localhost:27017/HotelHub");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
	console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
	await Hotel.deleteMany({});
	for (let i = 0; i < 300; i++) {
		const random528 = Math.floor(Math.random() * 528);
		const imgIndexOne = (i % 15) * 2;
		const imgIndexTwo = imgIndexOne + 1;
		const price = (Math.floor(Math.random() * 300) + 20) * 100 - 1;
		const hotel = new Hotel({
			author: "66b0ce2cfa0847c1c8a1df2d",
			location: `${indianCities[random528].city}, ${indianCities[random528].state}`,
			geometry: {
				type: "Point",
				coordinates: [indianCities[random528].longitude, indianCities[random528].latitude],
			},
			images: [
				{
					url: defaultImages[imgIndexOne].path,
					filename: defaultImages[imgIndexOne].filename,
					isDefault: true,
				},
				{
					url: defaultImages[imgIndexTwo].path,
					filename: defaultImages[imgIndexTwo].filename,
					isDefault: true,
				},
			],
			title: `${sample(descriptors)} ${sample(places)} Hotel`,
			price: price,
			description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus id nulla quia, temporibus tempora adipisci officia magnam sed beatae sequi doloremque tempore at ab itaque nisi cum quos sit. Amet.Ipsum itaque reiciendis molestias vero dolorum beatae suscipit nemo doloribus, maxime omnis iste facilis! Ea consectetur inventore odio id alias quo tenetur ipsum modi vel esse, voluptatem sunt cum sit.`,
		});
		await hotel.save();
	}
};

seedDB().then(() => {
	db.close();
});
