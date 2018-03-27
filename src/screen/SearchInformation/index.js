import React, {Component} from 'react';
import {
  StyleSheet, Text, View, TextInput, Modal, TouchableOpacity, Dimensions, Alert,
  ToastAndroid
} from 'react-native';
import TitleBar from '../../components/TitleBar'
import SubmitButton from '../../components/SubmitButton'
import Line from '../../components/Line'
import Icon from 'react-native-vector-icons/FontAwesome';
import web3API from '../../utils/web3API'
import {link} from "../../actions/navActions";
import {connect} from "react-redux";
let web3 = new web3API();
import SQLUtils from '../../utils/SQLUtils'
let sqlite = new SQLUtils()
@connect((store) => {
  return {}
})
export default class SearchInformation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user_card: '',
      resultVisible: false,
      modalVisible: false,
      password: '',
      isPassword: false,
      wallet: {},
      resultInfo:{}
    }
  }

  componentDidMount = () => {
    sqlite.getCurrentWallet().then((data) => {
      this.setState({wallet: data});
      console.log(data);
    })
  }
  componentWillUnmount = () => {
    sqlite.close();
  }
  setModalVisible(visible) {
    this.setState({modalVisible: visible, isPassword: false, password: ''});
  }
  onPressSend() {
    //this.state.user_card
    //this.state.password
    sqlite.getCurrentWallet().then((wallet) => {
      let keyStore = wallet.keystore;
      let user_mobile = "";
      web3.queryInfo(this.state.wallet, keyStore, this.state.user_card, user_mobile, this.state.password).then((msg) => {
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
            this.setState({resultInfo:msg.data.data});
            this.setState({resultVisible: true, modalVisible: false, isPassword: false});
            // Alert.alert("提交成功 ");
            return;
          } else if (msg.data.code == 2) {
            Alert.alert("密码错误，请重新输入!");
            return;
          }else if (msg.data.code == 3) {
            Alert.alert("发生意外!"+msg.data.msg);
            return;
          }
          else {
            Alert.alert("未查询到记录!");
            return;
          }
        }
      }).catch((err) => {
        Alert.alert("发生意外错误！");
        this.props.dispatch(link('Home'));
      })
    })
  }
  onPressConfirm() {

    this.setState({isPassword: true});
  }
  onPressSearch() {
    if(!web3.validateIfEmpty(this.state.user_card)){
      ToastAndroid.show('身份证号不能为空', ToastAndroid.SHORT);
      return;
    }
    else if(!web3.validateCardNum(this.state.carNum)){
      ToastAndroid.show('身份证号长度不对，或者号码不符合规定！', ToastAndroid.SHORT);
      return;
    }
    this.setState({resultVisible: false, modalVisible: true});
  }
  renderItem(text,value) {
    return (
      <View>
        <View style={styles.itemContainer}>
          <Text style={styles.titleText}>{text}</Text>
          <Text style={styles.contentText}>{value}</Text>
        </View>
        <Line/>
      </View>
    );
  }
  renderModalTitle(title) {
    return (
      <View style={styles.titleContainer}>
        <View style={styles.close}/>
        <Text style={styles.text}>{title}</Text>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.close}
          onPress={this.setModalVisible.bind(this, false)}
        >
          <Icon name="times" size={35} color='gray'/>
        </TouchableOpacity>
      </View>
    );
  }
  renderConfirm() {
    return (
      <View style={styles.confirmContainer}>
        {this.renderModalTitle('信息查询确认')}
        <Text style={styles.text}>本次查询，将向信息提供者提供token作为手续费</Text>
        <SubmitButton
          buttonText={'确认'}
          enable
          onPressButton={this.onPressConfirm.bind(this)}
        />
      </View>);
  }
  renderPassword() {
    return (
      <View style={styles.passwordContainer}>
        {this.renderModalTitle('请输入密码')}
        <Line/>
        <View style={styles.itemContainer}>
          <TextInput
            style={styles.input}
            underlineColorAndroid="transparent"
            placeholder={'请输入密码'}
            onChangeText={(text) => this.setState({password: text})}
            value={this.state.password}
            secureTextEntry
          />
          <TouchableOpacity activeOpacity={0.5} onPress={this.onPressSend.bind(this)}>
            <Text style={styles.sendText}>发送</Text>
          </TouchableOpacity>
        </View>
        <Line/>
      </View>
    );
  }
  render() {
    return (
      <View style={styles.container}>
        <TitleBar title='信息查询' type='1' name='Home'/>
        <Modal
          animationType='slide'
          transparent
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setModalVisible(false)
          }}
        >
          <View style={styles.modalContainer}>
            {this.state.isPassword ? this.renderPassword() : this.renderConfirm()}
          </View>
        </Modal>
        <View style={styles.mainContainer}>
          <View style={styles.accountContainer}>
            <Text style={styles.accountText}>身份证号</Text>
            <TextInput
              style={styles.accountInput}
              underlineColorAndroid="transparent"
              placeholder={'填写身份证号'}
              onChangeText={(text) => this.setState({user_card: text})}
              value={this.state.user_card}
            />
          </View>
          <SubmitButton buttonText={'查询信息'} enable onPressButton={this.onPressSearch.bind(this)}/>
          {this.state.resultVisible &&
          <View style={styles.resultContainer}>
            {this.renderItem('姓名',this.state.resultInfo.user_name)}
            {this.renderItem('手机号',this.state.resultInfo.user_mobile)}
            {this.renderItem('身份证号',this.state.resultInfo.user_card)}
            {this.renderItem('银行卡号',this.state.resultInfo.bank_num)}
            {this.renderItem('车牌号',this.state.resultInfo.plate_number)}
          </View>
          }
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
  accountContainer: {
    paddingLeft: 10,
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountText: {
    height: 50,
    textAlignVertical: 'center',
    fontSize: 16,
    color: '#71716d',
  },
  accountInput: {
    flex: 1,
    height: 50,
    marginLeft: 20,
    fontSize: 16,
    textAlignVertical: 'center',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  itemContainer: {
    flexDirection: 'row',
    paddingLeft: 10,
    backgroundColor: '#FFFFFF',
  },
  markContentText: {
    flex: 1,
    height: 110,
    marginTop: 15,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  titleText: {
    height: 50,
    width: 100,
    textAlignVertical: 'center',
    fontSize: 16,
    color: '#71716d',
  },
  contentText: {
    flex: 1,
    width: 100,
    textAlignVertical: 'center',
    fontSize: 16,
    color: '#71716d',
  },
  modalContainer: {
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
  sendText: {
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
  itemContainer: {
    flexDirection: 'row',
    paddingLeft: 10,
    backgroundColor: '#FFFFFF',
  },
  text: {
    height: 50,
    textAlignVertical: 'center',
    fontSize: 17,
    color: '#575757',
    marginHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    textAlignVertical: 'center',
  },
});
  