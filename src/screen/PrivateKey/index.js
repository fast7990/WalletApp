import React, { Component } from 'react';
import {StyleSheet, Text, View, TextInput, TouchableHighlight} from 'react-native';
import TitleBar from '../../components/TitleBar'
import SubmitButton from '../../components/SubmitButton'

export default class PrivateKey extends Component {
	constructor(props) {
		super(props)
		this.state = { 
			
		}
    }
	render(){
		return (
			<View style={styles.container}>
				<TitleBar title='备份私匙' type='0'/>
				<View style={styles.warning}>
					<Text style={styles.warning_text}>
						为了方便备份, 我们将钱包账户加密为以下英文字母组成的密匙,
					</Text>
					<Text style={styles.warning_text}>
						备份该密匙即可恢复钱包。
					</Text>
				</View>
				<View style={styles.encrypt}>
					<Text>
						************************
					</Text>
				</View>
				<SubmitButton buttonText='解锁' enable={true} style={{ marginTop : 15, marginLeft:20, marginRight:20 }}/>
				<View style={styles.red_warning}>
					<View style={styles.red_warning_wrapper}>
						<Text style={styles.red_warning_text}>
							* 按顺序将密匙复制或抄录在纸上, 并妥善保存
						</Text>
					</View>
					<View style={styles.red_warning_wrapper}> 
						<Text style={styles.red_warning_text}>
							* 任何人获得你的密匙信息即可操作你的钱包资金
						</Text>
					</View>
				</View>
			</View>
		)
	}
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#EEE',
	},
	warning : {
		height : 50,
		backgroundColor : 'powderblue',
		padding : 3,
		justifyContent : 'center'
	},
	warning_text : {
		fontSize : 13,
		color : 'steelblue',
		flex : 1
	},
	encrypt : {
		backgroundColor : 'antiquewhite',
		height : 60,
		marginTop : 30,
		marginLeft: 20,
		marginRight: 20,
		alignItems : 'center',
		justifyContent : 'center'
	},
	encrypt_text : {
		fontSize : 12
	},
	red_warning : {
		height : 60,
		marginTop : 30,
		marginLeft : 20,
		marginRight : 20
	},
	red_warning_wrapper : {
		flex : 1,
		justifyContent : 'center' 
	},
	red_warning_text : {
		color : 'red',
		fontWeight : 'bold'
	},
	icon : {
		height: 140,
		alignItems : 'center',
		justifyContent : 'center'
	},
	smallMenu : {
		height : 135,
		backgroundColor : 'white',
	},
	smallMenu_item : {
		flex : 1,
		flexDirection : 'row',
		alignItems : 'center',
		justifyContent : 'space-between'
	},
	smallMenu_item_left : {
		alignItems : 'center',
		justifyContent : 'center',
		height : 20
	},
	smallMenu_item_right : {
		height : 16,
		width : 16,
		marginRight : 10,
		alignItems : 'center',
		justifyContent : 'center'
	},
	smallMenu_item_text : {
		fontSize : 16
	},
	smallMenu_item_icon : {
		
	},
	buttonLayer : {
		
	},
	grayLine: {
		borderBottomWidth : 0.5,
		borderColor : 'gray'
	}
})