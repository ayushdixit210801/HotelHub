maptilersdk.config.apiKey = maptilerApiKey;

const map = new maptilersdk.Map({
	container: "map",
	style: maptilersdk.MapStyle.BRIGHT,
	center: hotel.geometry.coordinates, // starting position [lng, lat]
	zoom: 10, // starting zoom
});

new maptilersdk.Marker()
	.setLngLat(hotel.geometry.coordinates)
	.setPopup(new maptilersdk.Popup({ offset: 25 }).setHTML(`<h3>${hotel.title}</h3><p>${hotel.location}</p>`))
	.addTo(map);
