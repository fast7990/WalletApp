import React, {Component} from 'react';
import {StyleSheet, Text, View, TextInput, Alert, ToastAndroid} from 'react-native';
import TitleBar from '../../components/TitleBar'
import SubmitButton from '../../components/SubmitButton'
import SQLUtils from '../../utils/SQLUtils'

let sqlite = new SQLUtils()
import web3API from '../../utils/web3API'
import {connect} from "react-redux";
import {link} from "../../actions/navActions";

let web3 = new web3API()
@connect((store) => {
  return {}
})
export default class ImportWallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keystore: '',
      account: '',
      password: '',
      confirmPassword: '',
    }
  }
  componentDidMount = () => {
    sqlite.close()
  }
  setAccount(text) {
    this.setState({account: text});
  }
  setPassword(text) {
    this.setState({password: text});
  }
  setConfirmPassword(text) {
    this.setState({confirmPassword: text});
  }
  onPressImport = () => {
    if (this.state.password != this.state.confirmPassword) {
      ToastAndroid.show('两次密码不一致', ToastAndroid.SHORT);
      return;
    }
    let account_name = this.state.account;
    let password = this.state.confirmPassword;
    let keystore = '{"address":"d1cc2a7ac904d7f510a9a7a7b54e23ae82671b2e","crypto":{"cipher":"aes-128-ctr","ciphertext":"1529f93d1d4dac5fbc8a9c67f8b43abaedc558be3fe5d584f69c50b74e7ecfdc","cipherparams":{"iv":"656a9a4bf8e7501d13aa79c444db5904"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"22cc471525cb8e174a923d10e1db5910047b9e4fdc444bbddd142252f4ef1a26"},"mac":"f1bc533b29e84349d2dbc21336b5f07cf8c39b2b277ba5cfdcf883b7d2d4397c"},"id":"433898e3-0610-4734-8bd2-ccda6699e1e8","version":3}'
    if (this.state.keystore != '') {
      keystore = this.state.keystore;
    }
    web3.importWallet(account_name, password, keystore).then((msg) => {
      if (msg != null) {
        console.log(msg)
        sqlite.getAllActionHistory().then((histories) => {
          console.log(histories)
          let msgString = JSON.stringify(msg)
          let data = {
            id: histories[histories.length - 1].id,
            resulttype: msg.data.code,
            resultmsg: msgString
          }
          sqlite.updateActionHistory(data).then(() => {
            console.log('更新成功')
          }).catch(() => {
            console.log('更新失败')
          })
        }).catch((err) => {
          console.log(err)
        })
        if (msg.data.code == 1) {
          if (account_name != null || account_name != '') {
            let data = msg.data
            data.data.name = account_name;
            sqlite.insertWallets(data.data).then((msg) => {
              if (msg == "1") {
                Alert.alert('导入成功 ！');
                this.props.dispatch(link('Home'));
              } else {
                Alert.alert("插入账号数据发生意外错误！");
                this.props.dispatch(link('Home'));
              }
            }).catch((err) => {
              Alert.alert("插入账号数据发生意外错误！", err);
            })
          }
        } else {
          Alert.alert("私钥串或者密码错误，请重新输入！");
        }
      } else {
        Alert.alert("发生意外错误！");
        this.props.dispatch(link('Home'));
      }
    }).catch((err) => {
      Alert.alert("发生意外错误！");
      this.props.dispatch(link('Home'));
    })
  }
  renderItem(text, password, isPassword, changeInput) {
    return (
      <View>
        <View style={styles.grayLine}/>
        <View style={styles.keyContainer}>
          <Text style={styles.text}>{text}</Text>
          <TextInput
            style={styles.input}
            underlineColorAndroid="transparent"
            onChangeText={(text) => changeInput(text)}
            value={password}
            secureTextEntry={isPassword}
          />
        </View>
      </View>
    );
  }
  render() {
    return (
      <View style={styles.container}>
        <TitleBar title='账户导入' type='1' name='Home'/>
        <View style={styles.inputContainer}>
          <View style={styles.keyContainer}>
            <Text style={styles.keyText}>*</Text>
            <TextInput
              style={styles.keystore}
              multiline
              underlineColorAndroid="transparent"
              onChangeText={(text) => this.setState({keystore: text})}
              value={this.state.keystore}
              placeholder={'在此填入活跃权限私钥'}
            />
          </View>
          {this.renderItem('账户', this.state.account, false, this.setAccount.bind(this))}
          {this.renderItem('输入密码', this.state.password, true, this.setPassword.bind(this))}
          {this.renderItem('确认密码', this.state.confirmPassword, true, this.setConfirmPassword.bind(this))}
        </View>
        <SubmitButton enable buttonText={'确认导入'} onPressButton={this.onPressImport.bind(this)}/>
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
  keyContainer: {
    flexDirection: 'row'
  },
  keyText: {
    color: 'red',
    paddingTop: 10,
  },
  keystore: {
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
  text: {
    height: 50,
    width: 80,
    textAlignVertical: 'center',
    fontSize: 16,
    color: '#71716d',
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    textAlignVertical: 'center',
  },
});