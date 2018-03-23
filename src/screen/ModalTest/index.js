import React from 'react';
import {Text, TouchableOpacity, View, TextInput} from 'react-native';
import Modal from 'react-native-simple-modal';
 
export default class ModalTest extends React.Component {
	
	constructor(props){
		super(props)
		this.state = {
			password : '',
			open : false,
			offset : 0,
			show : false
		}
	}
	
	onPasswordChange = () => {
		console.log(this.state.password)
	}
	
	onShowChange = () => {
		this.setState({
			show : !this.state.show
		})
	}
	
	modalDidOpen = () => console.log('Modal did open.')

	modalDidClose = () => {
		this.setState({open: false});
		console.log('Modal did close.');
	}

	moveUp = () => this.setState({offset: -100})

	resetPosition = () => this.setState({offset: 0})

	openModal = () => this.setState({open: true})

	closeModal = () => this.setState({open: false})

	render() {
		let v = this.state.show ? <Text>待显示的内容</Text> : null
		return (
			<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
				<TouchableOpacity onPress={this.openModal}>
					<Text>Open modal</Text>
				</TouchableOpacity>
				<Modal
					offset={this.state.offset}
					open={this.state.open}
					modalDidOpen={this.modalDidOpen}
					modalDidClose={this.modalDidClose}
					style={{alignItems: 'center'}}
				>
					<View style={{alignItems: 'center'}}>
						<Text style={{fontSize: 20, marginBottom: 10}}>Hello world!</Text>
						<TextInput 
							secureTextEntry={true} 
							autoFocus={true}
							onChangeText={(text) => this.setState({password:text})}
							value={this.state.password}
						/>
						<TouchableOpacity
							style={{margin: 5}}
							onPress={this.onPasswordChange}
						>
							<Text>确定</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={{margin: 5}}
							onPress={this.onShowChange}
						>
							<Text>显示</Text>
						</TouchableOpacity>
						{v}
						<TouchableOpacity
							style={{margin: 5}}
							onPress={this.closeModal}
						>
							<Text>Close modal</Text>
						</TouchableOpacity>
					</View>
				</Modal>
			</View>
		)
	}
}