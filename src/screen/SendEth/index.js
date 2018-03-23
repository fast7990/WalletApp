import React, {Component} from 'react';
import {StyleSheet, Text, View, TextInput, Dimensions, Alert, TouchableHighlight} from 'react-native';
import TitleBar from '../../components/TitleBar';
import SubmitButton from '../../components/SubmitButton';
import BottomModal from '../../components/BottomModal';
import ErrorText from '../../components/ErrorText';
import SQLUtils from '../../utils/SQLUtils'

let sqlite = new SQLUtils()
import web3API from '../../utils/web3API'
import {connect} from "react-redux";
import {link} from "../../actions/navActions";

let web3 = new web3API()

@connect((store) => {
  return {}
})
export default class SendEth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wallet:{},
      myAccount: '',
      toAccount: '',
      sendNum: '',
      mark: '',
      modalVisible: false,
      error: '',
    };
  }

  componentDidMount = () => {
    sqlite.getCurrentWallet().then((data) => {
      //Alert.alert(data.account)
      this.setState({myAccount: data.account});
      this.setState({wallet: data});
      console.log(data)
      console.log(this.state.myAccount)
    })
  }

  componentWillUnmount = () => {
    sqlite.close()
  }

  setAccount(text) {
    this.setState({myAccount: text});
  }

  setToAccount(text) {
    this.setState({toAccount: text});
  }

  setSendNum(text) {
    this.setState({sendNum: text});
  }

  onPressSend() {
    // storage.saveString('current_account', "0xd1cc2a7ac904d7f510a9a7a7b54e23ae82671b2e");
    this.setState({modalVisible: true, error: ''});
  }

  onPressConfirmSend = (toAccount, password) => {
    web3.sendEth(this.state.wallet.keystore,this.state.myAccount, toAccount, password, this.state.sendNum, "").then((msg) => {
      if (msg != null) {
        console.log(msg)
        sqlite.getAllActionHistory().then((histories)=>{
          console.log(histories)
          let msgString = JSON.stringify(msg)
          let data = {
            id : histories[histories.length - 1].id,
            resulttype: msg.data.code,
            resultmsg : msgString
          }
          sqlite.updateActionHistory(data).then(()=>{
            console.log('更新成功')
          }).catch(()=>{
            console.log('更新失败')
          })
        }).catch((err)=>{
          console.log(err)
        })
        if (msg.data.code == 1) {
          this.setState({modalVisible: false});
          Alert.alert("提交成功 ");
          this.props.dispatch(link('Home'));
          return;
        } else if (msg.data.code == 2) {
          Alert.alert("密码错误，请重新输入!");
          return;
        } else {
          this.setState({modalVisible: false});
          Alert.alert("发生意外错误！" + msg.msg);
          return;
        }
      }
    }).catch((err) => {
      this.setState({modalVisible: false});
      Alert.alert("发生意外错误！");
      this.props.dispatch(link('Home'));
    })
  }

  renderItem(text, placeholder, editable, changeInput, value) {
    return (
      <View>
        <View style={styles.itemContainer}>
          <Text style={styles.text}>{text}</Text>
          <TextInput
            style={styles.input}
            underlineColorAndroid="transparent"
            placeholder={placeholder}
            onChangeText={(text) => changeInput(text)}
            value={value}
            editable={editable}
          />
        </View>
        <View style={styles.grayLine}/>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <BottomModal
          amountName='ETH'
          toAccount={this.state.toAccount}
          sendNum={this.state.sendNum}
          visible={this.state.modalVisible}
          onPressConfirm={this.onPressConfirmSend.bind(this)}
        />
        <View style={styles.mainContainer}>
          <TitleBar title='发送Eth' type='0'/>
          <View style={styles.inputContainer}>
            {this.renderItem('发送账户', '发送账户', false, this.setAccount.bind(this), this.state.myAccount)}
            {this.renderItem('对方账户', '填写对方账号', true, this.setToAccount.bind(this))}
            {this.renderItem('发送数量', '填写eth数量', true, this.setSendNum.bind(this))}
          </View>
          {/*<View style={styles.itemContainer}>*/}
          {/*<Text style={styles.text}>备注(MEMO)</Text>*/}
          {/*<TextInput*/}
          {/*style={styles.markInput}*/}
          {/*multiline*/}
          {/*underlineColorAndroid="transparent"*/}
          {/*placeholder={'选填'}*/}
          {/*/>*/}
          {/*</View>*/}
          <ErrorText text={this.state.error}/>
          <SubmitButton buttonText={'发送'} enable onPressButton={this.onPressSend.bind(this)}/>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mainContainer: {
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
  dropdown : {
    height: 50,
    width : 100,
    alignItems : 'center',
    justifyContent: 'center'
  },
});
  