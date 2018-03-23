import React, { Component } from 'react'
import { AppRegistry} from 'react-native'
import { Provider } from 'react-redux'

import AppWithNavigationState from './src/navigators/AppNavigator'
import store from './src/store'

export default class App extends Component {
	render() {
		return (
			<Provider store = {store}>
				<AppWithNavigationState />
			</Provider>
		)
	}
}

AppRegistry.registerComponent('App', () => App)