maptilersdk.config.apiKey = maptilerApiKey;

const map = new maptilersdk.Map({
	container: "map",
	style: maptilersdk.MapStyle.BRIGHT,
	center: [79.1900834, 21.2275312],
	zoom: 3,
});

map.on("load", function () {
	map.addSource("hotels", {
		type: "geojson",
		data: hotels,
		cluster: true,
		clusterMaxZoom: 14, // Max zoom to cluster points on
		clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
	});

	map.addLayer({
		id: "clusters",
		type: "circle",
		source: "hotels",
		filter: ["has", "point_count"],
		paint: {
			// Use step expressions (https://docs.maptiler.com/gl-style-specification/expressions/#step)
			// with three steps to implement three types of circles:
			"circle-color": ["step", ["get", "point_count"], "#00BCD4", 10, "#00BCD4", 30, "#00BCD4"],
			"circle-radius": ["step", ["get", "point_count"], 15, 10, 20, 30, 25],
		},
	});

	map.addLayer({
		id: "cluster-count",
		type: "symbol",
		source: "hotels",
		filter: ["has", "point_count"],
		layout: {
			"text-field": "{point_count_abbreviated}",
			"text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
			"text-size": 14,
		},
	});

	map.addLayer({
		id: "unclustered-point",
		type: "circle",
		source: "hotels",
		filter: ["!", ["has", "point_count"]],
		paint: {
			"circle-color": "#11b4da",
			"circle-radius": 6,
			"circle-stroke-width": 1,
			"circle-stroke-color": "#fff",
		},
	});

	// inspect a cluster on click
	map.on("click", "clusters", async (e) => {
		const features = map.queryRenderedFeatures(e.point, {
			layers: ["clusters"],
		});
		const clusterId = features[0].properties.cluster_id;
		const zoom = await map.getSource("hotels").getClusterExpansionZoom(clusterId);
		map.easeTo({
			center: features[0].geometry.coordinates,
			zoom,
		});
	});

	// When a click event occurs on a feature in
	// the unclustered-point layer, open a popup at
	// the location of the feature, with
	// description HTML from its properties.
	map.on("click", "unclustered-point", function (e) {
		const { popUpMarkup } = e.features[0].properties;
		const coordinates = e.features[0].geometry.coordinates.slice();
		// Ensure that if the map is zoomed out such that
		// multiple copies of the feature are visible, the
		// popup appears over the copy being pointed to.
		while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
			coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
		}

		new maptilersdk.Popup().setLngLat(coordinates).setHTML(popUpMarkup).addTo(map);
	});

	map.on("mouseenter", "clusters", () => {
		map.getCanvas().style.cursor = "pointer";
	});
	map.on("mouseleave", "clusters", () => {
		map.getCanvas().style.cursor = "";
	});
});
