import { createStore, applyMiddleware, compose } from "redux"
import { useMemo } from "react"
import logger from "redux-logger"
import thunk from "redux-thunk"
import { createWrapper, HYDRATE } from "next-redux-wrapper"
import rootReducer from "./reducer"

const initialState = {}
const middleware = [thunk]

const reducer = (state, action) => {
	if (action.type === HYDRATE) {
		const nextState = {
			...state,
			...action.payload
		}
		return nextState
	} else {
		return rootReducer(state, action)
	}
}

// First store
const store = createStore(
	rootReducer,
	initialState,
	compose(applyMiddleware(...middleware, logger))
)
export default store

// Make store
const makeStore = () =>
	createStore(reducer, initialState, compose(applyMiddleware(...middleware, logger)))
export const wrapper = createWrapper(makeStore, { debug: true })

const initStore = (preloadedState = initialState) => {
	createStore(rootReducer, preloadedState, compose(applyMiddleware(...middleware, logger)))
}

export const initializeStore = (preloadedState) => {
	let _store = store ?? initStore(preloadedState)
	if (preloadedState && store) {
		_store = initStore({
			...store.getState(),
			...preloadedState
		})
		store = undefined
	}

	if (typeof window === "undefined") return _store
	if (!store) store = _store

	return _store
}

export const useStore = (initialState) => {
	const store = useMemo(() => initializeStore(initialState), [initialState])
	return store
}

export type AppDispatch = typeof store.dispatch
