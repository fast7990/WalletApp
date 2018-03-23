export function loginAction(user, token) {
	return {
		type: "LOGIN",
		payload: {
			user,
			token
			
		}
	}
}

export function loginFailure(error) {
	return {
		type: "LOGIN_FAILURE",
		payload: {
			error : error
		}
	}
}

export function logout() {
	return {
		type: "LOGOUT"
	}
}