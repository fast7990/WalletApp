import React, { Component } from 'react';
import {StyleSheet, Text, View, TextInput, Modal, TouchableOpacity, Dimensions} from 'react-native';
import SubmitButton from '../SubmitButton';
import Icon from 'react-native-vector-icons/FontAwesome';
import web3API from '../../utils/web3API'
let web3 = new web3API()
export default class BottomModal extends Component {
  static defaultProps={
    visible:false,
    amountName: '',
    toAccount: '',
    sendNum: '',
    onPressConfirm: null,
    isPassword:true,
    onPasswordError: null,
    password:'',
  };
  constructor(props) {
    super(props);
    this.state = {
      password: this.props.password,
      visible: this.props.visible,
      isPassword: this.props.isPassword,
      toAccount: this.props.toAccount,
      password:this.props.password,
    };
  }

  componentDidMount() {
    console.log(this.state.isPassword)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({visible: nextProps.visible, toAccount: nextProps.toAccount, isPassword:nextProps.isPassword, password:nextProps.password});
  }
  setVisible(visible) {
    this.setState({visible: visible, isPassword: true, password: ''});
  }
  setToAccount(text){
    this.setState({toAccount: text});
  }
  onPressNext() {
    if(this.state.password) {
      this.setState({isPassword: false});
    }else {
      this.setVisible(false);
    }
  }
  onPressConfirmSend() {
    this.props.onPressConfirm(this.state.toAccount, this.state.password);
  }
  renderItem(text, placeholder, changeInput) {
    return(
      <View>
        <View style={styles.itemContainer}>
          <Text style={styles.text}>{text}</Text>
          <TextInput
            style={styles.input}
            underlineColorAndroid="transparent"
            placeholder={placeholder}
            onChangeText={(text) => changeInput(text)}
          />
        </View>
        <View style={styles.grayLine}/>
      </View>
    );
  }
  renderModalTitle(title) {
    return(
      <View style={styles.titleContainer}>
        <View style={styles.close}/>
        <Text style={styles.text}>{title}</Text>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.close}
          onPress={this.setVisible.bind(this, false)}
        >
          <Icon name="times" size={35} color='gray'/>
        </TouchableOpacity>
      </View>
    );
  }
  renderConfirm() {
    return(
      <View style={styles.confirmContainer}>
        {this.renderModalTitle('确认转账')}
        <View style={styles.confirmNumContainer}>
          <Text style={styles.amountText}>{this.props.amountName}</Text>
          <Text style={styles.amountNumText}>{this.props.sendNum}</Text>
        </View>
        <Text/>
        {this.renderItem('对方账户',web3.getShortAccount(this.state.toAccount), this.setToAccount.bind(this))}
        {/*{this.renderItem('备注MEMO','')}*/}
        <SubmitButton
          buttonText={'发送'}
          enable
          onPressButton={this.onPressConfirmSend.bind(this)}
        />
      </View>);
  }
  renderPassword() {
    return(
      <View style={styles.passwordContainer}>
        {this.renderModalTitle('请输入密码')}
        <View style={styles.grayLine}/>
        <View style={styles.itemContainer}>
          <TextInput
            style={styles.input}
            underlineColorAndroid="transparent"
            placeholder={'请输入密码'}
            onChangeText={(text) => this.setState({password: text})}
            value={this.state.password}
            secureTextEntry
          />
          <TouchableOpacity activeOpacity={0.5} onPress={this.onPressNext.bind(this)}>
            <Text style={styles.nextText}>下一步</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.grayLine}/>
      </View>
    );
  }

  render() {
    return (
      <Modal
        animationType='slide'
        transparent
        visible={this.state.visible}
        onRequestClose={() => {this.setVisible(false)}}
      >
        <View style={styles.container}>
          {this.state.isPassword ? this.renderPassword() : this.renderConfirm()}
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  passwordContainer: {
    height: 160,
    width: Dimensions.get('window').width,
    justifyContent: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 55,
  },
  close: {
    width: 55,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextText: {
    height: 50,
    width: 70,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: '#6699ff',
    color: 'white',
    fontSize: 15,
  },
  confirmContainer: {
    height: 300,
    width: Dimensions.get('window').width,
    justifyContent: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  confirmNumContainer: {
    height: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  amountNumText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6699ff',
    marginLeft: 5,
  },
  itemContainer: {
    flexDirection: 'row',
    paddingLeft: 10,
    backgroundColor: '#FFFFFF',
  },
  grayLine: {
    height: 0.5,
    width: Dimensions.get('window').width,
    backgroundColor: 'gray',
  },
  text: {
    height: 50,
    width: 100,
    textAlignVertical: 'center',
    fontSize: 17,
    color: '#575757',
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    textAlignVertical: 'center',
  },
});