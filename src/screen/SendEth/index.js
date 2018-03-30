import React, {Component} from 'react';
import {StyleSheet, Text, View, TextInput, Dimensions, Alert,TouchableOpacity,
  TouchableHighlight, DeviceEventEmitter} from 'react-native';
import TitleBar from '../../components/TitleBar';
import SubmitButton from '../../components/SubmitButton';
import BottomModal from '../../components/BottomModal';
import ErrorText from '../../components/ErrorText';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {connect} from "react-redux";
import {link} from "../../actions/navActions";
import SQLiteUtils from '../../utils/SQLiteUtils';
let sqlite = new SQLiteUtils();
import web3API from '../../utils/web3API';
let web3 = new web3API();
import ModalDropdown from 'react-native-modal-dropdown';
@connect((store) => {
  return {}
})
export default class SendEth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wallet:{},
      myAccount: '',
      shortAccount: '',
      toAccount: '',
      sendNum: '',
      mark: '',
      modalVisible: false,
      error: '',
      password: '',
      isPassword: true,
      account_list:null,
      account_short_list:null,
    };
  }
  componentDidMount = () => {
    sqlite.getCurrentWallet().then((data) => {
      //Alert.alert(data.account)
      let str = web3.getShortAccount2(data.account);
      this.setState({myAccount: data.account});
      this.setState({shortAccount: str});
      this.setState({wallet: data});
      console.log(data)
      console.log(this.state.myAccount)
    })
    /*
    sqlite.getSendEthToAccount().then((msg)=>{
      console.log(msg)
      let arr = [];
      let shortArr = [];
      for(let i=0; i<msg.length;i++){
        arr.push(msg[i].to_account)
        shortArr.push(web3.getShortAccount2(msg[i].to_account))
      }
      this.setState({account_list : arr, account_short_list: shortArr});
      console.log(this.state.account_list);
    }).catch((err)=>{
      console.log(err)
    })*/
    sqlite.getAllWallets().then((wallets)=>{
      console.log(wallets);
      //得到所有钱包的account，不添加与当前用户account相等的钱包
      let arr = [];
      let shortArr = [];
      for (let i=0; i<wallets.length;i++){
        if(wallets[i].account != this.state.myAccount){
          arr.push(wallets[i].account);
          shortArr.push(web3.getShortAccount2(wallets[i].account));
        }
      }
      this.setState({account_list : arr, account_short_list: shortArr});
      console.log(this.state.account_list,this.state.account_short_list);
    }).catch((err)=>{
      console.log(err)
    })
  }
  componentWillUnmount = () => {
    sqlite.close()
  }
  onQRCallback = (data) => {
    this.setState(data)
  }
  popToHome = (emitterValue) => {
    DeviceEventEmitter.emit('WALLET', emitterValue);
    this.props.navigation.popToTop();
  }
  setMyAccount(text) {
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
    if(!web3.validateAccount(this.state.myAccount)){
      console.log(this.state.myAccount)
      this.setState({error: '发送账户格式有错误'});
      return;
    }
    //如果对方账户有错，错误提示 对方账户格式有误
    if(!web3.validateAccount(this.state.toAccount)){
      console.log(this.state.toAccount)
      this.setState({error: '对方账户格式有错误'});
      return;
    }
    else if(!web3.validateIfEmpty(this.state.sendNum)){
      this.setState({error: '发送数量不能为空'});
      return;
    }
    else if(!web3.validateNumber(this.state.sendNum)){
      this.setState({error: '发送数量必须为数字'});
      return;
    }
    //如果密码格式有错，错误提示 密码格式有误
    /*else if(!web3.validatePassword(this.state.password)){
      this.setState({modalVisible: true, error: '密码格式有错误'})
    } */
    else {
      this.setState({modalVisible: true, error: ''})
    }
  }
  onPasswordError(msg){
    this.setState({error:msg, modalVisible:false})
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
          this.popToHome('success');
          //this.props.dispatch(link('Home'));
          return;
        } else if (msg.data.code == 2) {
          this.setState({modalVisible: false, isPassword: true, password:''});
          Alert.alert("密码错误，请重新输入!");
          return;
        } else {
          this.setState({modalVisible: false, isPassword: true, password:''});
          Alert.alert("发生意外错误！" + msg.data.msg);
          return;
        }
      }
    }).catch((err) => {
      this.setState({modalVisible: false, isPassword: true, password:''});
      Alert.alert("发生意外错误！");
      this.popToHome('fail');
      //this.props.dispatch(link('Home'));
    })
  }
  /*
  <ModalDropdown
    options={this.state.account_short_list}
    onSelect={(idx, value) => this._onDropdownSelect(idx, value)}
    renderRow={this._renderRow}
  >
    <FontAwesome name="question-circle" size={40}/>
  </ModalDropdown>*/
  renderItem1(text, placeholder, hasImage, source, editable, changeInput, value) {
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
          {hasImage && !source &&
          <FontAwesome name="question-circle" size={40}/>
          }
          {hasImage && source &&
          <ModalDropdown
            options={this.state.account_short_list}
            onSelect={(idx, value) => this._onDropdownSelect(idx, value)}
            renderRow={this._renderRow}
          >
            <FontAwesome name="question-circle" size={40}/>
          </ModalDropdown>
          }
        </View>
        <View style={styles.grayLine}/>
      </View>
    );
  }
  renderItem2(text, placeholder, hasImage, source, editable, changeInput, value) {
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
          {hasImage && !source &&
          <FontAwesome name="question-circle" size={40}/>
          }
          {hasImage && source &&
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.close}
            onPress={() => {
              this.props.navigation.navigate('QRTest',{ onQRCallback: this.onQRCallback });
            }}
          >
            <FontAwesome name="question-circle" size={40}/>
            {/*<Image style={styles.iconImage} source={source}/>*/}
          </TouchableOpacity>
          }
        </View>
        <View style={styles.grayLine}/>
      </View>
    );
  }
  _onDropdownSelect = (idx, value) => {
    this.setState({
      myAccount : this.state.account_list[idx],
      shortAccount : web3.getShortAccount2(this.state.account_list[idx])
    })
    console.log(this.state.myAccount)
    sqlite.getAllWallets().then((wallets)=>{
      console.log(wallets);
      //得到所有钱包的account，不添加与当前用户account相等的钱包
      let arr = [];
      let shortArr = [];
      for (let i=0; i<wallets.length;i++){
        if(wallets[i].account != this.state.myAccount){
          arr.push(wallets[i].account);
          shortArr.push(web3.getShortAccount2(wallets[i].account));
        }
      }
      this.setState({account_list : arr, account_short_list: shortArr});
      console.log(this.state.account_list,this.state.account_short_list);
    }).catch((err)=>{
      console.log(err)
    })
  }
  _renderRow = (rowData, rowID, highlighted) => {
    return(
      <View>
        <View style={styles.dropdown_row}>
          <Text style={styles.dropdown_row_text}>
            {rowData}
          </Text>
        </View>
      </View>
    )
  }
  render() {
    return (
      <View style={styles.container}>
        <BottomModal
          amountName='ETH'
          toAccount={this.state.toAccount}
          sendNum={this.state.sendNum}
          visible={this.state.modalVisible}
          password={this.state.password}
          onPressConfirm={this.onPressConfirmSend.bind(this)}
          onPasswordError={this.onPasswordError.bind(this)}
          onCloseVisible={() => {this.setState({modalVisible: false, password: ''})}}
        />
        <View style={styles.mainContainer}>
          <TitleBar title='发送Eth' type='1'/>
          <View style={styles.inputContainer}>
            {/*this.renderItem('发送账户', '发送账户', false, this.setMyAccount.bind(this), this.state.myAccount)*/}
            {/*this.renderItem('对方账户', '填写对方账号', true, this.setToAccount.bind(this))*/}
            {/*this.renderItem('发送数量', '填写eth数量', true, this.setSendNum.bind(this))*/}
            {this.renderItem1('发送账户', '发送账户', true, true, false, this.setMyAccount.bind(this), this.state.shortAccount)}
            {this.renderItem2('对方账户', '填写对方账号', true, true, true, this.setToAccount.bind(this), this.state.toAccount)}
            {this.renderItem2('发送数量', '填写eth数量', false, false, true, this.setSendNum.bind(this))}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
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
  dropdown_row: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
  },
  dropdown_row_text: {
    marginHorizontal: 4,
    fontSize: 18,
    textAlignVertical: 'center',
  },
});