import React, { Component } from 'react';
import {StyleSheet, Text, View, TextInput, Alert, ToastAndroid} from 'react-native';
import TitleBar from '../../components/TitleBar'
import SubmitButton from '../../components/SubmitButton'
import Line from '../../components/Line'
import SQLUtils from '../../utils/SQLUtils'
let sqlite = new SQLUtils()
import web3API from '../../utils/web3API'
import {link} from "../../actions/navActions";
import {connect} from "react-redux";
let web3 = new web3API()

@connect((store) => {
    return {

    }
})

export default class CreateWallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
        account: '',
        password:'',
        confirmPassword:''
    };
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
  onPressNext=()=> {
    let  account_name = this.state.account;
    let  password = this.state.confirmPassword;
    if(!web3.validateName(account_name)) {
      ToastAndroid.show('账户名少于四位', ToastAndroid.SHORT);
      return;
    }
    if( this.state.password != password){
      ToastAndroid.show('两次密码不一致', ToastAndroid.SHORT);
      return;
    }
    if(!web3.validatePassword(this.state.password)){
      ToastAndroid.show('密码格式错误！', ToastAndroid.SHORT);
      return;
    }
    web3.newWallet(account_name, password ).then((msg)=>{
          if (msg != null) {
              //  msg = JSON.parse(vMsg);
              if (msg.data.code == 1) {
                  msg.data.name = account_name;
                  if (account_name != null || account_name != '') {
                      let data = msg.data
                      data.data.name=account_name;
                      sqlite.insertWallets(data.data).then((msg)=>{
                          if(msg == "1"){
                              Alert.alert('账户导入成功 ！');
                              this.props.dispatch(link('Home'));
                          }else{
                              Alert.alert("发生意外错误，请重新新建账户！"  );
                              this.props.dispatch(link('Home'));
                          }
                      }).catch((err)=>{
                          Alert.alert("插入账号数据发生意外错误！",err);
                      })
                  }
              } else {
                  Alert.alert("发生意外错误！" ,msg.data.msg);
              }
          } else {
              Alert.alert("发生意外错误！");
          }
      }).catch((err)=>{
          Alert.alert("发生意外错误！");
      })
  }

  renderItem(text, placeholder, isPassword, changeInput, style){
    return(
      <View style={style}>
        <View style={styles.itemContainer}>
          <Text style={styles.text}>{text}</Text>
          <TextInput
            style={styles.input}
            underlineColorAndroid="transparent"
            placeholder={placeholder}
            onChangeText ={(text) => changeInput(text)}
            secureTextEntry={isPassword}
          />
        </View>
        <Line/>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <TitleBar title='钱包创建' type='0'/>
        {/*<View style={styles.itemContainer}>*/}
          {/*<Text style={styles.text}>账户名</Text>*/}
          {/*<TextInput*/}
            {/*style={styles.input}*/}
            {/*underlineColorAndroid="transparent"*/}
            {/*placeholder={'输入字母加数字的组合'}*/}
            {/*onChangeText={(text) => this.setState({account: text})}*/}
            {/*value={this.state.account}*/}
          {/*/>*/}
        {/*</View>*/}
        {this.renderItem('账户名', '汉字、字母、数字的组合不少于4位', false, this.setAccount.bind(this), styles.accountContainer)}
        {this.renderItem('密码', '', true, this.setPassword.bind(this))}
        {this.renderItem('确认密码', '', true, this.setConfirmPassword.bind(this))}
        <SubmitButton
          buttonText={'下一步'}
          enable={this.state.account && this.state.password && this.state.confirmPassword}
          onPressButton={this.onPressNext}
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
  accountContainer: {
    marginTop: 10,
  },
  itemContainer: {
    paddingLeft: 10,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    height: 50,
    textAlignVertical: 'center',
    fontSize: 17,
    color: '#575757',
    width: 80,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    textAlignVertical: 'center',
  },
});
  