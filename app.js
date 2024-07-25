const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Hotel = require("./models/hotel");

mongoose.connect("mongodb://localhost:27017/HotelHub");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
	console.log("Database connected");
});

const port = 3000;
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
	res.render("home");
});
app.get("/hotels", async (req, res) => {
	const hotels = await Hotel.find({});
	res.render("hotels/index", { hotels });
});
app.get("hotels/:id", async (req, res) => {
	const { id } = req.params;
	const hotel = await Hotel.findById(id);
	res.render("hotels/show", { hotel });
});

app.listen(port, () => {
	console.log(`Server running at port : ${port}`);
});
