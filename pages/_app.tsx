import "semantic-ui-css/semantic.min.css"
import "react-toastify/dist/ReactToastify.css"
import "@style/style.scss"
// import { AppProps } from "next/app"
// import { Provider, connect } from "react-redux"
import { AppProps } from "next/app"
import { Provider } from "react-redux"
import { ThemeProvider } from "@redux/ThemeProvider"
import React from "react"
// import store, { wrapper, useStore } from "@store/index"
import store from "@store/index"

/*
const App = ({ Component, pageProps }) => {
	const _store = useStore(pageProps.initialReduxState)
	// console.log("Store", _store)
	// console.log("pageProps", pageProps)
	return <Component {...pageProps} />
}
*/

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
	return (
		<Provider store={store}>
			<ThemeProvider>
				<Component {...pageProps} />
			</ThemeProvider>
		</Provider>
	)
}

// export default wrapper.withRedux(App)
export default App
