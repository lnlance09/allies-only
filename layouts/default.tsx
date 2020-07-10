import { Container, Grid } from "semantic-ui-react"
import { baseUrl, siteName } from "@options/config"
import { withTheme } from "@redux/ThemeProvider"
import Autocomplete from "@components/autocomplete"
import Footer from "@components/footer"
import Head from "next/head"
import Header from "@components/header"
import PropTypes from "prop-types"
import React, { Fragment, useState } from "react"
import Sidebar from "@components/sidebar"

const DefaultLayout: React.FC = ({
	activeItem,
	basicHeader,
	children,
	containerClassName,
	inverted,
	isText,
	loading,
	seo,
	showFooter,
	textAlign,
	useGrid
}) => {
	const [searchMode, setSearchMode] = useState(false)

	const { description, image, title, url, video } = seo
	const fullUrl = `${baseUrl}${url}`

	return (
		<div className={`body ${inverted ? "inverted" : ""}`}>
			<Head>
				<meta name="viewport" content="width=device-width, user-scalable=0" />
				<meta name="theme-color" content="#000000" />

				<meta property="fb:app_id" content="278970413183504" />
				<meta property="og:description" content={description} />

				{typeof video !== "undefined" && (
					<Fragment>
						<meta property="og:video" content={video.src} />
						<meta property="og:video:height" content={video.height} />
						<meta property="og:video:width" content={video.width} />
					</Fragment>
				)}

				{typeof image !== "undefined" && (
					<Fragment>
						<meta property="og:image" content={image.src} />
						<meta property="og:image:height" content={image.height} />
						<meta property="og:image:width" content={image.width} />
					</Fragment>
				)}

				<meta property="og:site_name" content="Allies Only" />
				<meta property="og:title" content={`${title} - ${siteName}`} />
				<meta property="og:type" content="website" />
				<meta property="og:url" content={fullUrl} />

				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:site" content="@onlyallies" />
				<meta name="twitter:creator" content="@onlyallies" />
				<meta name="twitter:title" content={`${title} - ${siteName}`} />
				<meta name="twitter:description" content={description} />

				{typeof video !== "undefined" ? (
					<meta name="twitter:player" content={video.src} />
				) : (
					<meta name="twitter:image" content={image.src} />
				)}

				<meta name="description" content={description} />
				<meta
					name="keywords"
					content="police interactions, body cam, unarmed, shootings, civil rights, black lives matter"
				/>
				<meta name="title" content={`${title} - ${siteName}`} />

				<link rel="canonical" href={fullUrl} />
				<link rel="home" href={baseUrl} />

				<link rel="icon" href={`${baseUrl}favicon.ico`} />
				<link rel="shortcut icon" href={`${baseUrl}favicon.ico`} />
				<link rel="apple-touch-icon" sizes="128x128" href={`${baseUrl}favicon.ico`} />

				<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDArCL_59nenZmhsD8v2NsbpuJzi9VRucg&libraries=places"></script>

				<title>
					{title} - {siteName}
				</title>
			</Head>

			{searchMode ? (
				<Container className="searchModeContainer">
					<Grid>
						<Grid.Row>
							<Grid.Column width={13}>
								<Autocomplete category mobileMode />
							</Grid.Column>
							<Grid.Column width={3}>
								<span
									className="closeSearchMode"
									onClick={() => setSearchMode(false)}
								>
									Cancel
								</span>
							</Grid.Column>
						</Grid.Row>
					</Grid>
				</Container>
			) : (
				<Fragment>
					<Header
						basicHeader={basicHeader}
						loading={loading}
						toggleSearchMode={() => setSearchMode(true)}
					/>
					<Container
						className={`mainContainer ${containerClassName} ${
							inverted ? "inverted" : ""
						}`}
						text={isText}
						textAlign={textAlign}
					>
						{useGrid ? (
							<Grid className="mainGrid" stackable>
								<Grid.Column className="leftColumn" width={4}>
									<Sidebar activeItem={activeItem} inverted={inverted} />
								</Grid.Column>
								<Grid.Column className="rightColumn" width={12}>
									{children}
								</Grid.Column>
							</Grid>
						) : (
							<Fragment>{children}</Fragment>
						)}
					</Container>
					{showFooter && <Footer />}
				</Fragment>
			)}

			<script>
				var sc_project=12355929; var sc_invisible=1; var sc_security="473549b2"; var
				sc_https=1;
			</script>
			<script src="https://www.statcounter.com/counter/counter.js" async></script>
		</div>
	)
}

DefaultLayout.propTypes = {
	activeItem: PropTypes.string,
	basicHeader: PropTypes.bool,
	children: PropTypes.node,
	containerClassName: PropTypes.string,
	inverted: PropTypes.bool,
	isText: PropTypes.bool,
	loading: PropTypes.bool,
	seo: PropTypes.shape({
		description: PropTypes.string,
		image: PropTypes.shape({
			height: PropTypes.number,
			src: PropTypes.string,
			width: PropTypes.number
		}),
		title: PropTypes.string,
		url: PropTypes.string,
		video: PropTypes.shape({
			height: PropTypes.number,
			src: PropTypes.string,
			width: PropTypes.number
		})
	}),
	showFooter: PropTypes.bool,
	textAlign: PropTypes.string,
	useGrid: PropTypes.bool
}

DefaultLayout.defaultProps = {
	activeItem: "departments",
	basicHeader: false,
	containerClassName: "",
	inverted: true,
	isText: false,
	seo: {
		image: {}
	},
	showFooter: true,
	textAlign: "left",
	useGrid: true
}

export default withTheme("dark")(DefaultLayout)
