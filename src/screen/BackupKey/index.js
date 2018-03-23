import React, { Component } from 'react';
import {StyleSheet, Text, View, TextInput} from 'react-native';
import TitleBar from '../../components/TitleBar'
import SubmitButton from '../../components/SubmitButton'
import Icon from 'react-native-vector-icons/FontAwesome'

export default class BackupKey extends Component {
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
						当APP被删后在其他手机上使用钱包时, 需导入当前钱包备份 
					</Text>
					<Text style={styles.warning_text}>
						私钥,否则可能永久丢失钱包资产, 请务必备份好钱包, 并妥善保管
					</Text>
					<Text style={styles.warning_text}>
						备份信息。
					</Text>
				</View>
				<View style={styles.icon}>
					<View style={{borderWidths:0.5,borderColor:'gray'}}>
						<Icon size={60} name={'question'} color={'gray'}/>
					</View>
				</View>
				<View style={styles.smallMenu}>
					<View style={{paddingLeft : 10, height : 135}}>
						<View style={[styles.smallMenu_item, styles.grayLine]}>
							<View style={styles.smallMenu_item_left}>
								<Text style={styles.smallMenu_item_text}>
									钱包账号
								</Text>
							</View>
							<View style={styles.smallMenu_item_right}>
								
							</View>
						</View>
						<View style={[styles.smallMenu_item, styles.grayLine]}>
							<View style={styles.smallMenu_item_left}>
								<Text style={styles.smallMenu_item_text}>
									钱包资产(DACT)
								</Text>
							</View>
							<View style={styles.smallMenu_item_right}>
								<Text>**</Text>
							</View>
						</View>
						<View style={styles.smallMenu_item}>
							<View style={styles.smallMenu_item_left}>
								<Text style={styles.smallMenu_item_text}>私匙</Text>
							</View>
							<View style={styles.smallMenu_item_right}>
								<Icon name={'chevron-right'} size={14} />
							</View>
						</View>
					</View>
				</View>
				<View style={styles.buttonLayer}>
					<SubmitButton buttonText='备份钥匙' enable={true} style={{ marginTop : 80, marginLeft:40, marginRight:40}}/>
					<SubmitButton buttonText='删除钱包' enable={false} style={{ marginTop : 20, marginLeft:40, marginRight:40 }}/>
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
		height : 70,
		backgroundColor : 'powderblue',
		padding : 3,
		justifyContent : 'center'
	},
	warning_text : {
		fontSize : 13,
		color : 'steelblue',
		flex : 1
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