import React, { Component } from 'react'
import {StyleSheet, Text, View, TouchableHighlight} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { connect } from 'react-redux'
import { link } from '../../actions/navActions'
@connect((store) => {
	return {
		nav : store.nav
	}
})

export default class TitleBar extends Component {

	static defaultProps={  
		title:'',
	}
    constructor(props) {
		super(props)
    }
	_onBackButton = () => {
		const { dispatch, name, type , nav } = this.props
		console.log(nav)
		let navArray = nav.routes
		let lastRoute = navArray[navArray.length - 2].routeName
		//console.log(lastRoute)
		if( type === '0' ){
			 dispatch(link(lastRoute))
		}else if( type === '1' ){
			dispatch(link(name))
		}
	}
    render() {
		return (
			<View style={styles.container}>
				<View style={styles.left}>
					<TouchableHighlight onPress={this._onBackButton}>
						<Icon name="angle-left" size={50} color={'white'} style={styles.backIcon}/>
					</TouchableHighlight>
				</View>
				<View style={styles.center}>
					<Text style={styles.titleText}>{this.props.title}</Text>
				</View>
				<View style={styles.right}>
				</View>
			</View>
		)
	}
}
  
const styles = StyleSheet.create({
    container: {
		height: 40,
		alignItems: 'center',
		backgroundColor: '#3d3d3b',
		flexDirection: 'row'
	},
	left : {
		flex : 1,
		alignItems: 'center',
		flexDirection : 'row'
	},
	center : {
		flex : 1,
		alignItems: 'center',
		justifyContent : 'center'
	},
	right: {
		flex : 1,
		alignItems: 'center',
		flexDirection : 'row-reverse'
	},
	backIcon: {
		marginLeft : 10
	},
	titleText: {
		fontSize: 20,
		color: 'white'
	}
})
  