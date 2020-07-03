import { Button, Container, Form, Header, TextArea } from "semantic-ui-react"
import { withTheme } from "@redux/ThemeProvider"
import { toast } from "react-toastify"
import { getConfig } from "@options/toast"
import axios from "axios"
import DefaultLayout from "@layouts/default"
import PropTypes from "prop-types"
import React, { useState } from "react"

const toastConfig = getConfig()
toast.configure(toastConfig)

const Contact: React.FC = ({ inverted }) => {
	const [msg, setMsg] = useState("")

	const sendMessage = async () => {
		await axios
			.post("/api/contact/send", {
				msg: msg.trim()
			})
			.then((response) => {
				toast.success(response.data.msg)
				setMsg("")
			})
			.catch((error) => {
				toast.error(error.response.data.msg)
			})
	}

	return (
		<DefaultLayout
			activeItem={null}
			containerClassName="contactPage"
			seo={{
				description: "Contact Us",
				image: {
					height: 500,
					src: "/public/images/logos/logo.png",
					width: 500
				},
				title: "Contact",
				url: "contact"
			}}
			showFooter={false}
		>
			<Container>
				<Header as="h1" inverted={inverted} size="huge">
					Contact Us
				</Header>

				<Header as="p" inverted={inverted}></Header>

				<Form inverted={inverted} size="big">
					<TextArea
						onChange={(e, { value }) => setMsg(value)}
						placeholder="Let us know what's good"
						rows={6}
						value={msg}
					/>
				</Form>

				<Button
					className="contactUsButton"
					color="yellow"
					content="Send"
					disabled={msg.length === 0}
					inverted={inverted}
					fluid
					onClick={() => sendMessage()}
					size="big"
				/>
			</Container>
		</DefaultLayout>
	)
}

Contact.propTypes = {
	inverted: PropTypes.bool
}

export default withTheme("dark")(Contact)
