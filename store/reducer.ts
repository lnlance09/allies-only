import { combineReducers } from "redux"
import authentication from "@reducers/authentication"
import meme from "@reducers/meme"
import search from "@reducers/search"
import template from "@reducers/template"
import user from "@reducers/user"

export default combineReducers({
	authentication,
	meme,
	search,
	template,
	user
})
