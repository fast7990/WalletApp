import React, { Component } from 'react';
import {StyleSheet, Text, View, TextInput, ToastAndroid, Alert} from 'react-native';
import SubmitButton from '../../components/SubmitButton'
import web3Utils from '../../utils/web3Utils';
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
    if(!web3.validateIfEmpty(this.state.keyInput)){
      ToastAndroid.show('私钥不能为空', ToastAndroid.SHORT);
      return;
    }
    else if(!web3.validateIfEmpty(this.state.account)){
      ToastAndroid.show('账户不能为空', ToastAndroid.SHORT);
      return;
    }
    else if(!web3.validateIfEmpty(this.state.password)){
      ToastAndroid.show('密码不能为空', ToastAndroid.SHORT);
      return;
    }
    if (this.state.password != this.state.confirmPassword) {
      ToastAndroid.show('两次密码不一致', ToastAndroid.SHORT);
      return;
    }
    let account_name = this.state.account;
    let password = this.state.confirmPassword;
    let mnemonic = this.state.keyInput;
    web3Utils.getKeysoreByMnemonic(account_name,mnemonic,password).then((data) => {
      sqlite.insertWallets(data).then((msg) => {
        if (msg == "1") {
          Alert.alert('导入成功 ！');
          this.popToHome('success');
          //this.props.dispatch(link('Home'));
        } else {
          Alert.alert("插入账号数据发生意外错误！");
          this.popToHome('success');
          //this.props.dispatch(link('Home'));
        }
      }).catch((err) => {
        Alert.alert("插入账号数据发生意外错误！", err);
      })
    }).catch((err) => {
      Alert.alert("发生意外错误！");
      this.popToHome('fail');
      //this.props.dispatch(link('Home'));
    })
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
          buttonText={'开始导入'}
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
