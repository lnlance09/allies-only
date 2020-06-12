import DefaultLayout from "@layouts/default"
import React from "react"

const NotFoundPage: React.FunctionComponent = () => {
	return (
		<DefaultLayout
			containerClassName="404Page"
			seo={{
				description: "",
				image: {
					height: 200,
					src: "",
					width: 200
				},
				title: "",
				url: ""
			}}
		></DefaultLayout>
	)
}

export default NotFoundPage
