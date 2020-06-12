export const toDataURL = (src, callback, outputFormat) => {
	const img = new Image()
	img.crossOrigin = "Anonymous"
	img.onload = function () {
		const canvas = document.createElement("CANVAS")
		const ctx = canvas.getContext("2d")

		canvas.height = this.naturalHeight
		canvas.width = this.naturalWidth
		ctx.drawImage(this, 0, 0)
		const dataURL = canvas.toDataURL(outputFormat)
		callback(dataURL)
		return null
	}

	img.src = src
	if (img.complete || img.complete === undefined) {
		img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
		img.src = src
	}
}
