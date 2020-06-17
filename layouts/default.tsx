import { Container, Divider, Grid, Image, Menu } from "semantic-ui-react"
import { baseUrl } from "@options/config"
import { useRouter } from "next/router"
import { withTheme } from "@redux/ThemeProvider"
import Footer from "@components/footer"
import Head from "next/head"
import Logo from "@public/images/logos/logo_72x72.png"
import PropTypes from "prop-types"
import React, { Fragment } from "react"
import Sidebar from "@components/sidebar"

const DefaultLayout: React.FunctionComponent = ({
	activeItem,
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
	const router = useRouter()
	const { description, image, title, url } = seo
	const fullUrl = `${baseUrl}${url}`

	return (
		<div className={`body ${inverted ? "inverted" : ""}`}>
			<Head>
				<meta charset="utf8mb4" />
				<meta name="viewport" content="width=device-width, user-scalable=0" />
				<meta name="theme-color" content="#000000" />

				<meta property="fb:app_id" content="498572440350555" />
				<meta property="og:description" content={description} />
				<meta property="og:image" content={image.src} />
				<meta property="og:image:height" content={image.height} />
				<meta property="og:image:width" content={image.width} />
				<meta property="og:site_name" content="Blather" />
				<meta property="og:title" content={`${title} - Brandy`} />
				<meta property="og:type" content="website" />
				<meta property="og:url" content={fullUrl} />

				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:site" content="@blatherio" />
				<meta name="twitter:creator" content="@blatherio" />
				<meta name="twitter:title" content={`${title} - Brandy`} />
				<meta name="twitter:description" content={description} />
				<meta name="twitter:image" content={image.src} />

				<meta name="description" content={description} />
				<meta name="keywords" content="" />
				<meta name="title" content={`${title} - Brandy`} />

				<link rel="canonical" href={fullUrl} />
				<link rel="home" href="" />

				<link rel="icon" href="/favicon.ico" />
				<link rel="shortcut icon" href="/favicon.ico?v=3" />
				<link rel="apple-touch-icon" sizes="128x128" href="/favicon.ico?v=3" />

				<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDArCL_59nenZmhsD8v2NsbpuJzi9VRucg&libraries=places"></script>

				<title>{title} - Allies Only</title>
			</Head>

			<div className="rainbow" />
			{loading && (
				<Fragment>
					<div className="subline inc" />
					<div className="subline dec" />
				</Fragment>
			)}

			<Menu
				className="topHeader"
				borderless
				fitted="vertically"
				fixed="top"
				inverted={inverted}
			>
				<Container>
					<Menu.Item>
						<Image className="logo" onClick={() => router.push("/")} src={Logo} />
					</Menu.Item>
				</Container>
			</Menu>

			<Container
				className={`mainContainer ${containerClassName} ${inverted ? "inverted" : ""}`}
				text={isText}
				textAlign={textAlign}
			>
				{useGrid ? (
					<Grid stackable>
						<Grid.Column width={4}>
							<Sidebar activeItem={activeItem} inverted={inverted} />
						</Grid.Column>
						<Grid.Column width={12}>{children}</Grid.Column>
					</Grid>
				) : (
					<Fragment>{children}</Fragment>
				)}
			</Container>
			{showFooter && <Footer />}
		</div>
	)
}

DefaultLayout.propTypes = {
	activeItem: PropTypes.string,
	children: PropTypes.node,
	containerClassName: PropTypes.string,
	inverted: PropTypes.bool,
	isText: PropTypes.bool,
	seo: PropTypes.shape({
		description: PropTypes.string,
		image: PropTypes.shape({
			height: PropTypes.number,
			src: PropTypes.string,
			width: PropTypes.number
		}),
		title: PropTypes.string,
		url: PropTypes.string
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
