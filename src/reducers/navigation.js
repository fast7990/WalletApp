import { AppNavigator } from '../navigators/AppNavigator'
import { NavigationActions } from 'react-navigation'



export default (state, action) => {
	let newState
	switch(action.type) {
		case 'NAV_LINK':
			newState = AppNavigator.router.getStateForAction(
				NavigationActions.navigate({ routeName: action.payload.name }),
				state
			)
			break
		default:
			newState = AppNavigator.router.getStateForAction(action, state)
			break
	}
	return newState || state
}
