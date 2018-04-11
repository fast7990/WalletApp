import React from 'react'
import { View, Text, StyleSheet, TouchableHighlight, Image, SectionList } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { connect } from 'react-redux'
import { link } from '../actions/navActions'

@connect((store) => {
	return {
		
	}
})

export default class Menu extends React.Component {
  static defaultProps={
    pushToAccount:null,
  }
	constructor(props){
		super(props)
	}
	componentDidMount(){
		console.log(this.props)
	}
	GetSectionListItem=(item)=>{
		const { dispatch } = this.props
		console.log(item)
		if(item.id === '0') {
			dispatch(link('ImportWallet'))
		}else if(item.id === '1') {
			dispatch(link('ImportWallet'))
		}else if(item.id === '2') {
			dispatch(link('CreateWallet'))
		}else if(item.id === '3') {
			dispatch(link('ManageWallet'))
		}else if(item.id === '4') {
			dispatch(link('Records'))
		}else if(item.id === '5') {
			dispatch(link('ImportInformation'))
		}else if(item.id === '6') {
			dispatch(link('WebView2'))
		}
		// else if(item.id === '7') {
		// 	dispatch(link('PrivateKey'))
		// }
		else if(item.id === '7') {
      this.props.pushToAccount();
      //dispatch(link('AccountInformation'))
		}
		// else if(item.id === '9') {
		// 	dispatch(link('Mnemonic'))
		// }
		else if(item.id === '8') {
			dispatch(link('MyProperty'))
		}
	}
	renderItemHeader = ({item}) => (
		<View style={styles.header}>
			<Icon name={'user-circle'} size={60} style={styles.header_icon} onPress={this.GetSectionListItem.bind(this, item)}/>
		</View>
	)
	renderItemList = ({item}) => (
		<TouchableHighlight onPress={this.GetSectionListItem.bind(this, item)}>
		<View style={styles.menu_item} >
			<Icon name={item.icon} size={15} style={styles.menu_item_icon}/>
			<Text style={styles.SectionListItemStyle} > 
				{ item.name } 
			</Text>
		</View>		
		</TouchableHighlight>
	)
	render () {
		const { nav } = this.props
		let H = [{'id': '0','name':'header'}]
		let A = [
			{'id': '1','name': '导入钱包', 'icon': 'inbox'}, 
			{'id': '2','name': '创建钱包', 'icon': 'google-wallet'}
		]
		let B = [
			{'id': '3','name': '管理钱包', 'icon': 'dashboard'},
			{'id': '4','name': '收发记录', 'icon': 'get-pocket'},
			{'id': '5','name': '信息提交', 'icon': 'envelope'},
			{'id': '6','name': '信息查询', 'icon': 'search'},
			// {'id': '7','name': '身份信息', 'icon': 'info'}
		]
		let C = [
			{'id': '7','name': '账户管理', 'icon': 'key'},
			// {'id': '9','name': '助记词', 'icon': 'sticky-note'},
			{'id': '8','name': '我的资产', 'icon': 'language'},
		] 
		return (
			<View style={{flex: 1, backgroundColor: '#fff'}}>
				<SectionList 
					style={styles.menu}
					sections={[
						{ data: H, renderItem: this.renderItemHeader },
						{ data: A, renderItem: this.renderItemList },
						{ data: B, renderItem: this.renderItemList },
						{ data: C, renderItem: this.renderItemList }
					]}
					renderSectionHeader={({section}) => 
						<View style={{borderRadius: 4,
							borderWidth: 0.5,
							borderColor: '#d6d7da',}}>
						</View> 
					}
					keyExtractor={(item, index) => index}
				/>
			</View>
		)
	}
}

styles = StyleSheet.create({
	header : {
		height : 150,
		alignItems : 'center',
		justifyContent : 'center',
		backgroundColor : 'white'
	},
	menu : {
		flex : 1,
		backgroundColor : 'white' 
	},
	menu_item : {
		height : 60,
		alignItems : 'center',
		flexDirection: 'row'
	},
	menu_item_icon : {
		marginLeft : 15
	},
	SectionListItemStyle:{
		fontSize : 15,
		padding: 5,
		color: '#000',
		backgroundColor : 'white',
		marginLeft : 15
	}
})