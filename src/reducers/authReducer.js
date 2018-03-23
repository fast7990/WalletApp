const defaultState = {
	isLoggedIn: false,
	currentUser: null,
	errorMessage: null,
	token: null
}

export default function reducer(state = defaultState, action) {
	switch (action.type) {
		case 'LOGIN': 
			return {
				...state, 
				isLoggedIn: true,
				currentUser: action.payload.user,
				errorMessage: null,
				token: action.payload.token
			}
		case 'LOGIN_FAILURE':
			return {
				...state,
				isLoggedIng: false,
				errorMessage: action.payload.error
			}
		case 'LOGOUT':
			return {
				...state,
				isLoggedIn: false,
				currentUser: null,
				errorMessage: null,
				token: null
			}
		default:
			return state
	}
}