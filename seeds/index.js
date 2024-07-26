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

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
	await Hotel.deleteMany({});
	for (let i = 0; i < 50; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;
		const hotel = new Hotel({
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			image: `https://picsum.photos/400?random=${Math.random()}`,
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
