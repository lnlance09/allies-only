import "semantic-ui-css/semantic.min.css"
import "react-toastify/dist/ReactToastify.css"
import "@style/style.scss"
import "core-js/stable"
import "regenerator-runtime/runtime"
import { AppProps } from "next/app"
import { Provider } from "react-redux"
import { ThemeProvider } from "@redux/ThemeProvider"
import React from "react"
import { useStore } from "@store/index"

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
	const store = useStore(pageProps.initialReduxState)

	return (
		<Provider store={store}>
			<ThemeProvider>
				<Component {...pageProps} />
			</ThemeProvider>
		</Provider>
	)
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
/*
App.getInitialProps = async (appContext) => {
	// calls page's `getInitialProps` and fills `appProps.pageProps`
	const appProps = await App.getInitialProps(appContext)

	return { ...appProps }
}
*/

export default App
