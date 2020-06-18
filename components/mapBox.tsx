import React, { useState } from "react"
import ReactMapGL from "react-map-gl"
import PropTypes from "prop-types"

const MapBox: React.FunctionComponent = ({ height, lat, lng, width, zoom }) => {
	const [viewport, setViewport] = useState({
		height,
		latitude: lat,
		longitude: lng,
		width,
		zoom
	})

	return (
		<ReactMapGL
			mapboxApiAccessToken="pk.eyJ1IjoibG5sYW5jZTA5IiwiYSI6ImNrOGM0bXNwZDBkMDgzbW4yanExOWV3d3UifQ.-d8NKcr5Iry-6bIYpq53EA"
			mapStyle="mapbox://styles/mapbox/streets-v9"
			onViewportChange={(viewport) => setViewport(viewport)}
			{...viewport}
		/>
	)
}

MapBox.propTypes = {
	height: PropTypes.string,
	lat: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	lng: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	markerId: PropTypes.string,
	markers: PropTypes.array,
	onClickMarker: PropTypes.func,
	width: PropTypes.string,
	zoom: PropTypes.number
}

MapBox.defaultProps = {
	height: "100%",
	markerId: "0",
	markers: [],
	width: "100%",
	zoom: 10
}

export default MapBox
