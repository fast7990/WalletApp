import React, { Component } from 'react';
import {StyleSheet, Text, View, TextInput, ToastAndroid} from 'react-native';
import TitleBar from '../../components/TitleBar'
import SubmitButton from '../../components/SubmitButton'

export default class Mnemonic extends Component {

  constructor(props) {
    super(props);
    this.state = {
      keyInput: '',
      account: '',
      password: '',
      confirmPassword: '',
      enableButton: false,
    }
  }

  setAccount(text){
    this.setState({account: text});
  }

  setPassword(text){
    this.setState({password: text});
  }

  setConfirmPassword(text){
    this.setState({confirmPassword: text});
  }

  onPressImport() {
    if (!/[a-z0-9]$/.test(this.state.account) || this.state.account.length <= 6) {
      ToastAndroid.show('This is a toast with short duration', ToastAndroid.SHORT);
    }
  }

  renderItem(text, password, isPassword, changeInput){
    return(
      <View>
        <View style={styles.grayLine}/>
        <View style={styles.itemContainer}>
          <Text style={styles.itemText}>{text}</Text>
          <TextInput
            style={styles.itemInput}
            underlineColorAndroid="transparent"
            onChangeText={(text) => changeInput(text)}
            value={password}
            secureTextEntry={isPassword}
            placeholder={'6位字符以上'}
          />
        </View>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <TitleBar title='助记词' type='1' name='Home'/>
        <View style={styles.inputContainer}>
          <View style={styles.itemContainer}>
            <Text style={styles.keyText}>*</Text>
            <TextInput
              style={styles.keyInput}
              multiline
              underlineColorAndroid="transparent"
              onChangeText={(text) => this.setState({keyInput: text})}
              value={this.state.keyInput}
              placeholder={'在此填入助记词'}
            />
          </View>
          {this.renderItem('账户', this.state.account, false, this.setAccount.bind(this))}
          {this.renderItem('输入密码', this.state.password, true, this.setPassword.bind(this))}
          {this.renderItem('确认密码', this.state.confirmPassword, true, this.setConfirmPassword.bind(this))}
        </View>
        <SubmitButton
          buttonText={'找回账户'}
          enable={this.state.keyInput && this.state.account && this.state.password && this.state.confirmPassword}
          onPressButton={this.onPressImport.bind(this)}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEE',
  },
  inputContainer: {
    paddingLeft: 10,
    marginTop: 10,
    backgroundColor: '#FFFFFF',
  },
  itemContainer: {
    flexDirection: 'row'
  },
  keyText: {
    color: 'red',
    paddingTop: 10,
  },
  keyInput: {
    flex: 1,
    height: 110,
    textAlignVertical: 'top',
  },
  grayLine: {
    height: 0.5,
    flexGrow: 1,
    flexShrink: 1,
    backgroundColor: 'gray',
  },
  passwordContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  itemText: {
    height: 50,
    width: 80,
    textAlignVertical: 'center',
    fontSize: 17,
    color: '#575757',
  },
  itemInput: {
    flex: 1,
    height: 50,
    marginLeft: 20,
    fontSize: 16,
    textAlignVertical: 'center',
  },
});
