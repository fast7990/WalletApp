import { combineReducers } from "redux"
import auth from "./authReducer"
import nav from "./navigation"
import sqlite from "./sqliteReducer"

export default combineReducers({
	auth,
	nav,
  sqlite
})
