const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const Hotel = require("./models/hotel");
const methodOverride = require("method-override");

mongoose.connect("mongodb://localhost:27017/HotelHub");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
	console.log("Database connected");
});

const port = 3000;
const app = express();

app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
	res.render("home");
});
app.get("/hotels", async (req, res) => {
	const hotels = await Hotel.find({});
	res.render("hotels/index", { hotels });
});
app.get("/hotels/new", (req, res) => {
	res.render("hotels/new");
});
app.post("/hotels", async (req, res) => {
	const hotel = new Hotel(req.body.hotel);
	await hotel.save();
	res.redirect(`/hotels/${hotel._id}`);
});
app.get("/hotels/:id", async (req, res) => {
	const { id } = req.params;
	const hotel = await Hotel.findById(id);
	res.render("hotels/show", { hotel });
});
app.get("/hotels/:id/edit", async (req, res) => {
	const { id } = req.params;
	const hotel = await Hotel.findById(id);
	res.render("hotels/edit", { hotel });
});
app.put("/hotels/:id", async (req, res) => {
	const hotel = req.body.hotel;
	const { id } = req.params;
	await Hotel.findByIdAndUpdate(id, hotel);
	res.redirect(`/hotels/${id}`);
});
app.delete("/hotels/:id", async (req, res) => {
	const { id } = req.params;
	await Hotel.findByIdAndDelete(id);
	res.redirect("/hotels");
});

app.listen(port, () => {
	console.log(`Server running at port : ${port}`);
});
