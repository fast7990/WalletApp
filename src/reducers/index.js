import { combineReducers } from "redux"
import auth from "./authReducer"
import nav from "./navigation"

export default combineReducers({
	auth,
	nav
})
