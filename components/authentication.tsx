import {
	submitLoginForm,
	submitRegistrationForm,
	submitVerificationForm
} from "@actions/authentication"
import { Button, Form, Header, Input, Message, Segment } from "semantic-ui-react"
import { Provider, connect } from "react-redux"
import PropTypes from "prop-types"
import React, { useCallback, useState } from "react"
import store from "@store"

const Authentication: React.FunctionComponent = (props) => {
	const [buttonText, setButtonText] = useState("Create an account")
	const [email, setEmail] = useState("")
	const [headerText, setHeaderText] = useState("Sign In")
	const [loadingLogin, setLoadingLogin] = useState(false)
	const [loadingRegistration, setLoadingRegistration] = useState(false)
	const [login, setLogin] = useState(true)
	const [name, setName] = useState("")
	const [password, setPassword] = useState("")
	const [regEmail, setRegEmail] = useState("")
	const [registerText, setRegisterText] = useState("New to Brandy?")
	const [regPassword, setRegPassword] = useState("")
	const [username, setUsername] = useState("")
	const [verificationCode, setVerificationCode] = useState("")

	const toggleLogin = useCallback(() => {
		const buttonText = login ? "Sign in" : "Create an account"
		const headerText = login ? "Create an account" : "Sign In"
		const registerText = login ? "Already have an account?" : "New to Brandy?"
		setButtonText(buttonText)
		setHeaderText(headerText)
		setRegisterText(registerText)
		setLoadingLogin(false)
		setLoadingRegistration(false)
		setLogin(!login)
	}, [login])

	const submitLoginForm = () => {
		if (email.length > 0 && password.length > 0) {
			setLoadingLogin(true)
			props.submitLoginForm({
				email,
				password
			})
		}
	}

	const submitRegistrationForm = () => {
		setLoadingRegistration(true)
		props.submitRegistrationForm({
			email: regEmail,
			name,
			password: regPassword,
			username
		})
	}

	const submitVerificationForm = () => {
		if (verificationCode.length === 10) {
			props.submitVerificationForm({
				bearer: props.bearer,
				code: verificationCode
			})
		}
	}

	const ErrorMsg = () => {
		if (props.verify && props.verifyError) {
			return <Message content={props.verifyErrorMsg} error size="big" />
		}

		if (login && props.loginError) {
			return <Message content={props.loginErrorMsg} error size="big" />
		}

		if (!login && props.registerError) {
			return <Message content={props.registerErrorMsg} error size="big" />
		}

		return null
	}

	const InfoBox = () => {
		if (!props.verify) {
			return (
				<Header as="p" className="registerText" inverted={props.inverted}>
					{registerText}{" "}
					<span className="registerLink" onClick={() => toggleLogin()}>
						{buttonText}
					</span>
				</Header>
			)
		}

		return null
	}

	const MainForm = () => {
		if (props.verify) {
			return (
				<Form inverted={props.inverted} onSubmit={submitVerificationForm} size="big">
					<Form.Field>
						<Input
							inverted={props.inverted}
							onChange={(e, { value }) => setVerificationCode(value)}
							placeholder="Verification code"
							value={verificationCode}
						/>
					</Form.Field>
					<Button
						color="green"
						content="Verify"
						disabled={verificationCode.length !== 10}
						fluid
						inverted={props.inverted}
						size="big"
						type="submit"
					/>
				</Form>
			)
		}

		if (login) {
			return (
				<Form inverted={props.inverted} size="big">
					<Form.Field>
						<Input
							inverted={props.inverted}
							onChange={(e, { value }) => {
								setEmail(value)
							}}
							placeholder="Email or username"
							value={email}
						/>
					</Form.Field>
					<Form.Field>
						<Input
							inverted={props.inverted}
							onChange={(e, { value }) => {
								setPassword(value)
							}}
							placeholder="Password"
							type="password"
							value={password}
						/>
					</Form.Field>
					<Form.Field>
						<Button
							color="blue"
							content="Sign in"
							fluid
							inverted={props.inverted}
							loading={loadingLogin && !props.loginError}
							onClick={submitLoginForm}
							size="big"
							type="submit"
						/>
					</Form.Field>
				</Form>
			)
		}

		return (
			<Form inverted={props.inverted} size="big">
				<Form.Field>
					<Input
						inverted={props.inverted}
						onChange={(e, { value }) => {
							setRegEmail(value)
						}}
						placeholder="Email"
						value={regEmail}
					/>
				</Form.Field>
				<Form.Field>
					<Input
						inverted={props.inverted}
						onChange={(e, { value }) => {
							setRegPassword(value)
						}}
						value={regPassword}
						placeholder="Password"
						type="password"
					/>
				</Form.Field>
				<Form.Field>
					<Input
						autoComplete="off"
						inverted={props.inverted}
						onChange={(e, { value }) => {
							setName(value)
						}}
						placeholder="Full name"
						value={name}
					/>
				</Form.Field>
				<Form.Field>
					<Input
						inverted={props.inverted}
						onChange={(e, { value }) => {
							setUsername(value)
						}}
						placeholder="Username"
						value={username}
					/>
				</Form.Field>
				<Form.Field>
					<Button
						color="blue"
						content="Create an account"
						fluid
						inverted={props.inverted}
						loading={loadingRegistration && !props.registerError}
						onClick={submitRegistrationForm}
						size="big"
						type="submit"
					/>
				</Form.Field>
			</Form>
		)
	}

	return (
		<Provider store={store}>
			<div className="authComponent">
				<Header as="h1" inverted={props.inverted} size="huge">
					{props.verify ? "Verify your email" : headerText}
				</Header>
				<Segment basic className="authSegment" inverted={props.inverted}>
					{MainForm()}
					{ErrorMsg()}
				</Segment>
				{InfoBox()}
			</div>
		</Provider>
	)
}

Authentication.propTypes = {
	bearer: PropTypes.string,
	inverted: PropTypes.bool,
	loginError: PropTypes.bool,
	loginErrorMsg: PropTypes.string,
	registerError: PropTypes.bool,
	registerErrorMsg: PropTypes.string,
	submitLoginForm: PropTypes.func,
	submitRegistrationForm: PropTypes.func,
	submitVerificationForm: PropTypes.func,
	verify: PropTypes.bool,
	verifyError: PropTypes.bool,
	verifyErrorMsg: PropTypes.string
}

Authentication.defaultProps = {
	inverted: false,
	login: true,
	submitLoginForm,
	submitRegistrationForm,
	submitVerificationForm
}

const mapStateToProps = (state: any, ownProps: any) => ({
	...state.authentication,
	...ownProps
})

export default connect(mapStateToProps, {
	submitLoginForm,
	submitRegistrationForm,
	submitVerificationForm
})(Authentication)
