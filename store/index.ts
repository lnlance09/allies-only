import { createStore, applyMiddleware, compose } from "redux"
import { createWrapper } from "next-redux-wrapper"
import logger from "redux-logger"
import thunk from "redux-thunk"
import rootReducer from "./reducer"

const initialState = {}
const middleware = [thunk]

const store = createStore(
	rootReducer,
	initialState,
	compose(applyMiddleware(...middleware, logger))
)

const makeStore = () => createStore(rootReducer)

export default store

export const wrapper = createWrapper(makeStore, { debug: true })

export type AppDispatch = typeof store.dispatch
