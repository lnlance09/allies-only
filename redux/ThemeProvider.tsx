import React from "react"
import PropTypes from "prop-types"

const themes = {
	dark: {
		background: "#333"
	},
	light: {
		background: "#f5f5f9"
	}
}

const { Provider, Consumer } = React.createContext(themes)

export const ThemeProvider = ({ children }) => {
	return <Provider value={themes}>{children}</Provider>
}

ThemeProvider.propTypes = {
	children: PropTypes.node
}

export const withTheme = (theme: string) => {
	return (Component) => (props) => (
		<Consumer>
			{(themes) => {
				return (
					<Component
						{...props}
						inverted={theme === "dark"}
						style={{ ...themes[theme] }}
						theme={theme}
					/>
				)
			}}
		</Consumer>
	)
}
