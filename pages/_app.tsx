import "semantic-ui-css/semantic.min.css"
import "react-toastify/dist/ReactToastify.css"
import "@style/style.scss"
import "core-js/stable"
import "regenerator-runtime/runtime"
import { AppProps, Container } from "next/app"
import { Provider, connect } from "react-redux"
import { ThemeProvider } from "@redux/ThemeProvider"
import React from "react"
import store, { wrapper, useStore } from "@store/index"

const App = ({ Component, pageProps }) => {
	const _store = useStore(pageProps.initialReduxState)
	// console.log("Store", _store)
	// console.log("pageProps", pageProps)
	return <Component {...pageProps} />
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

//

export default wrapper.withRedux(App)
// export default connect()(App)
