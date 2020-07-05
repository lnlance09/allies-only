import { ToastOption } from "@interfaces/options"

export const getConfig = (): ToastOption => ({
	autoClose: 3500,
	closeOnClick: true,
	draggable: true,
	hideProgressBar: true,
	newestOnTop: true,
	position: "bottom-left"
})
