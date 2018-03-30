import React, { Component } from 'react'
import {StyleSheet, Text, View, TouchableOpacity, DeviceEventEmitter} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { connect } from 'react-redux'
import { link } from '../../actions/navActions'
import {NavigationActions } from 'react-navigation';

@connect((store) => {
	return {
		nav : store.nav
	}
})

export default class TitleBar extends Component {

	static defaultProps={  
		title:'',
    renderRight: null,
	}
  constructor(props) {
		super(props)
  }
	_onBackButton = () => {
		const { dispatch, name, type , nav } = this.props
		console.log(nav)
		// let navArray = nav.routes
		// let lastRoute = navArray[navArray.length - 2].routeName
		if( type === '0' ){
      dispatch(NavigationActions.back());
      //dispatch(link(lastRoute))
		}else if( type === '1' ){
      DeviceEventEmitter.emit('WALLET', 'render');
      dispatch(NavigationActions.back());
			//dispatch(link(name))
		}
	}
  render() {
		return (
			<View style={styles.container}>
				<View style={styles.left}>
					<TouchableOpacity activeOpacity={0.2}  onPress={this._onBackButton}>
						<Icon name="angle-left" size={50} color={'white'} style={styles.backIcon}/>
					</TouchableOpacity>
				</View>
				<View style={styles.center}>
					<Text style={styles.titleText}>{this.props.title}</Text>
				</View>
				<View style={styles.right}>
          {this.props.renderRight}
				</View>
			</View>
		)
	}
}
  
const styles = StyleSheet.create({
  container: {
		height: 50,
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
		paddingLeft : 10,
    paddingRight: 20,
	},
	titleText: {
		fontSize: 20,
		color: 'white'
	}
})
  