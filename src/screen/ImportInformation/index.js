import React, {Component} from 'react';
import {StyleSheet, Text, View, TextInput, Alert, ToastAndroid, DeviceEventEmitter} from 'react-native';
import TitleBar from '../../components/TitleBar'
import SubmitButton from '../../components/SubmitButton'
import SQLUtils from '../../utils/SQLUtils'

let sqlite = new SQLUtils()
import web3API from '../../utils/web3API'
import {link} from "../../actions/navActions";
import {connect} from "react-redux";

let web3 = new web3API()
@connect((store) => {
  return {}
})
export default class ImportInformation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      mobile: '',
      plate_Num: '',
      bankNum: '',
      carNum: '',
      wallet: {}
    };
  }

  componentDidMount = () => {
    sqlite.getCurrentWallet().then((data) => {
      this.setState({wallet: data});
      console.log(data)
      console.log(this.state.myAccount)
    })
  }
  componentWillUnmount = () => {
    sqlite.close()
  }

  popToHome = (emitterValue) => {
    DeviceEventEmitter.emit('WALLET', emitterValue);
    this.props.navigation.popToTop();
  }

  onPressSubmit = () => {
    if(!web3.validateIfEmpty(this.state.name)){
      ToastAndroid.show('姓名不能为空', ToastAndroid.SHORT);
      return;
    }
    else if(!web3.validateIfEmpty(this.state.mobile)){
      ToastAndroid.show('手机号不能为空', ToastAndroid.SHORT);
      return;
    }
    else if(!web3.validatePone(this.state.mobile)){
      ToastAndroid.show('手机号格式错误', ToastAndroid.SHORT);
      return;
    }
    else if(!web3.validateIfEmpty(this.state.carNum)){
      ToastAndroid.show('身份证号不能为空', ToastAndroid.SHORT);
      return;
    }
    else if(!web3.validateCardNum(this.state.carNum)){
      ToastAndroid.show('身份证号长度不对，或者号码不符合规定！', ToastAndroid.SHORT);
      return;
    }
    else {
      return true
    }
    let option = {
      'account_hash': this.state.wallet.account,
      'account': this.state.wallet.account,
      'user_name': this.state.name,
      'user_mobile': this.state.mobile,
      'user_card': this.state.carNum,
      'bank_num:': this.state.bankNum,
      'plate_number': this.state.plate_Num
    };
    web3.putInfo(option, this.state.wallet).then((msg) => {
      console.log(msg)
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
          Alert.alert("提交成功 ");
          this.popToHome('success');
          //this.props.dispatch(link('Home'));
          return;
        }else if (msg.data.code == 2) {
          Alert.alert("密码或钥匙串错误，请重新输入!");
          return;
        }else {
          Alert.alert("发生意外错误！"+msg.data.msg);
          return;
        }
      }
    }).catch((err) => {
      Alert.alert("发生意外错误！"+err);
    })
  }
  setMobile = (text) => {
    this.setState({mobile: text});
  }
  setBankNum = (text) => {
    this.setState({bankNum: text});
  }
  setCarNum = (text) => {
    this.setState({carNum: text});
  }
  setName = (text) => {
    this.setState({name: text});
  }
  setPlate_Num = (text) => {
    this.setState({plate_Num: text});
  }
  renderItem(text, placeholder, value, changeInput) {
    return (
      <View>
        <View style={styles.itemContainer}>
          <Text style={styles.text}>{text}</Text>
          <TextInput
            style={styles.input}
            underlineColorAndroid="transparent"
            placeholder={placeholder}
            value={value}
            onChangeText={(text) => {
              changeInput(text)
            }}
          />
        </View>
        <View style={styles.grayLine}/>
      </View>
    );
  }
  render() {
    return (
      <View style={styles.container}>
        <TitleBar title='信息录入' type='1' name='Home'/>
        <View style={styles.inputContainer}>
          {this.renderItem('姓名', '填写姓名 必填', this.state.name, this.setName.bind(this))}
          {this.renderItem('手机号', '手机号 必填', this.state.mobile, this.setMobile.bind(this))}
          {this.renderItem('身份证号', '填写身份证号 必填', this.state.carNum, this.setCarNum.bind(this))}
          {this.renderItem('银行卡号', '填写银行卡号', this.state.bankNum, this.setBankNum.bind(this))}
          {this.renderItem('车牌号', '填写车牌号', this.state.plate_Num, this.setPlate_Num.bind(this))}
        </View>

        <SubmitButton buttonText={'提交信息'} enable onPressButton={this.onPressSubmit}/>
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
    marginTop: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    paddingLeft: 10,
    backgroundColor: '#FFFFFF',
  },
  markInput: {
    flex: 1,
    height: 110,
    marginTop: 5,
    fontSize: 16,
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
    width: 100,
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
  