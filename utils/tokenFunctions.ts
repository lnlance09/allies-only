import jwt from "jsonwebtoken"
import { User } from "@interfaces/user"

const secret = "mysuperdupersecret"

export const parseJwt = (): User => {
	const token = localStorage.getItem("jwtToken")
	const decoded = jwt.verify(token, secret, (err, decoded) => {
		if (err) {
			return false
		}
		return decoded.data
	})
	return decoded
}

export const setToken = (data: User): string => {
	const token = jwt.sign({ data }, secret, {
		expiresIn: 60 * 60 * 336
	})
	localStorage.setItem("jwtToken", token)
	return token
}
