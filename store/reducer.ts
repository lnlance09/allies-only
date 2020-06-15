import { combineReducers } from "redux"
import authentication from "@reducers/authentication"
import department from "@reducers/department"
import interaction from "@reducers/interaction"
import officer from "@reducers/officer"
import user from "@reducers/user"

export default combineReducers({
	authentication,
	department,
	interaction,
	officer,
	user
})
