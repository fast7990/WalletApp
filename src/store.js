import { applyMiddleware, createStore } from "redux"

import { createLogger } from "redux-logger"
import thunk from "redux-thunk"
import promise from "redux-promise-middleware"

import reducer from "./reducers"
import { navMiddleware } from "./utils/redux"

const middleware = applyMiddleware(promise(), thunk, createLogger(), navMiddleware)

export default createStore(reducer, middleware)