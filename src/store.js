import { applyMiddleware, createStore } from "redux"

import { createLogger } from "redux-logger"
import thunk from "redux-thunk"
import promise from "redux-promise-middleware"

import reducer from "./reducers"
import { navMiddleware } from "./utils/redux"

const middleware = applyMiddleware(promise(), thunk, createLogger(), navMiddleware)
let store = createStore(reducer, middleware)
export default store