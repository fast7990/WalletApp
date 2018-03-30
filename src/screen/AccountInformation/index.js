import React, { Component } from 'react';
import {StyleSheet, Text, View, TextInput, ToastAndroid, Alert, TouchableOpacity, Image, Dimensions,
  DeviceEventEmitter, Modal, Clipboard} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import TitleBar from '../../components/TitleBar';
import SubmitButton from '../../components/SubmitButton';
import Line from '../../components/Line';
import SQLiteUtils from '../../utils/SQLiteUtils';
let sqlite = new SQLiteUtils();
import web3API from '../../utils/web3API';
let web3 = new web3API();


export default class AccountInformation extends Component {

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      password: '',
      isExportKey: true,
      isPassword: true,
      privateKey: 'aa'
    }
  }

  getPrivateKey(){
    sqlite.getCurrentWallet().then((data)=>{
      if(data == null){
        ToastAndroid.show('未存入数据！', ToastAndroid.SHORT);
      }else {
        this.setState({privateKey: data.privatekey})
      }
    }).catch((err)=>{
      console.log(err);
    })
  }

  popToHome = (emitterValue) => {
    DeviceEventEmitter.emit('WALLET', emitterValue);
    this.props.navigation.popToTop();
  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible, password: ''});
  }

  onPressChangePassword() {
    this.props.navigation.navigate('ChangePassword',
      {
        account: this.props.navigation.state.params.account,
      }
    );
  }

  onPressExportKey() {
    this.setState({modalVisible: true, password: '', isExportKey: true, isPassword: true});
  }

  onPressExportStore() {
    this.setState({modalVisible: true, password: '', isExportKey: false});
  }

  onPressDelete() {

  }

  onPressSave() {
    this.popToHome('render');
  }

  onPressConfirm() {
    if(this.state.isExportKey) {
      this.setState({isPassword: false});
      this.getPrivateKey();
    } else {
      this.setModalVisible(false);
      this.props.navigation.navigate('ExportKeystore');
    }
  }

  onPressCancel() {
    this.setModalVisible(false);
  }

  onPressCloseModal() {
    this.setState({modalVisible: false, password: '', isExportKey: true, isPassword: true});
  }

  onPressCopyKey() {
    Clipboard.setString(this.state.privateKey);
    ToastAndroid.show('已复制到剪贴板', ToastAndroid.SHORT);
    this.setState({modalVisible: false, password: '', isExportKey: true, isPassword: true});
  }

  renderSave() {
    return(
      <TouchableOpacity activeOpacity={0.2} onPress={this.onPressSave.bind(this)}>
        <Text style={styles.saveText}>保存</Text>
      </TouchableOpacity>
    );
  }

  renderItem(text, onPressItem) {
    return(
      <TouchableOpacity activeOpacity={0.2}  onPress={onPressItem}>
        <View style={styles.itemContainer}>
          <Text style={styles.text}>{text}</Text>
          <Icon name="angle-right" size={30}/>
        </View>
      </TouchableOpacity>
    );
  }

  renderTop() {
    return(
      <View style={styles.topContainer}>
        <Image
          style={styles.icon}
          source={require('./images/logo.png')}
        />
        <Text style={styles.ethText}>
          {this.props.navigation.state.params.eth + '  '}ETH
        </Text>
        <Text style={styles.accountText}>
          {web3.getShortAccount2(this.props.navigation.state.params.account)}
        </Text>
      </View>
    );
  }

  renderMiddle() {
    return(
      <View style={styles.middleContainer}>
        <Text style={styles.text}>钱包名</Text>
        <Text style={styles.text}>{this.props.navigation.state.params.name}</Text>
        <Line style={styles.line}/>
        {this.renderItem('修改密码', this.onPressChangePassword.bind(this))}
      </View>
    );
  }

  renderBottom() {
    return(
      <View style={styles.bottomContainer}>
        {this.renderItem('导出私钥', this.onPressExportKey.bind(this))}
        <Line style={styles.line}/>
        {this.renderItem('导出keystore', this.onPressExportStore.bind(this))}
      </View>
    );
  }

  renderModalTitle(title) {
    return (
      <View style={styles.titleContainer}>
        <View style={styles.close}/>
        <Text style={styles.modalTip}>{title}</Text>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.close}
          onPress={this.onPressCloseModal.bind(this)}
        >
          <Icon name="times" size={35} color='gray'/>
        </TouchableOpacity>
      </View>
    );
  }

  renderExportKey() {
    return(
      <View style={[styles.modalContentContainer, styles.modalPrivateKeyContainer]}>
        {this.renderModalTitle('导出私钥')}
        <View style={styles.modalKeyTipContainer}>
          <Text style={styles.modalKeyTipText}>安全警告：私钥未经加密，导出存在风险，建议使用助记词和Keystore进行备份。</Text>
        </View>
        <View style={styles.modalKeyContainer}>
          <Text style={styles.modalKeyText}>{this.state.privateKey}</Text>
        </View>
        <SubmitButton buttonText={'复制'} style={styles.copyButton} enable onPressButton={this.onPressCopyKey.bind(this)}/>
      </View>
    );
  }

  renderPassword() {
    return(
      <View style={styles.modalContentContainer}>
        <Text style={styles.modalTip}>请输入密码</Text>
        <TextInput
          secureTextEntry
          autoFocus
          underlineColorAndroid="transparent"
          onChangeText={(text) => this.setState({password:text})}
          value={this.state.password}
          style={styles.modalInput}
          placeholder={'Password'}
        />
        <View style={styles.modalOperationContainer}>
          <TouchableOpacity
            style={styles.cancelContainer}
            onPress={this.onPressCancel.bind(this)}
          >
            <Text style={styles.cancelText}>取消</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.confirmContainer}
            onPress={this.onPressConfirm.bind(this)}
          >
            <Text style={styles.confirmText}>确定</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <Modal
          animationType='fade'
          transparent
          visible={this.state.modalVisible}
          onRequestClose={() => {this.setModalVisible(false)}}
        >
          <View style={styles.modalContainer}>
            {this.state.isPassword ? this.renderPassword() : this.renderExportKey()}
          </View>
        </Modal>
        <View style={styles.mainContainer}>
          <TitleBar title={this.props.navigation.state.params.name} type='1' renderRight={this.renderSave()}/>
          {this.renderTop()}
          {this.renderMiddle()}
          {this.renderBottom()}
          <SubmitButton buttonText={'删除钱包'} enable onPressButton={this.onPressDelete.bind(this)}/>
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
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContentContainer: {
    height: 200,
    width: Dimensions.get('window').width - 40,
    marginHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
  },
  modalTip: {
    fontSize: 20,
    marginVertical: 30,
    color: 'black',
    fontWeight: 'bold',
    textAlignVertical: 'center',
  },
  modalInput: {
    height: 40,
    width: Dimensions.get('window').width - 70,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 5,
  },
  modalOperationContainer: {
    width: Dimensions.get('window').width - 30,
    flexDirection: 'row',
    marginTop: 20,
  },
  cancelContainer: {
    flex: 1,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 0.3,
    borderRightWidth: 0.3,
  },
  cancelText: {
    fontSize:20,
    color: '#5CACEE',
    fontWeight: 'bold',
  },
  confirmContainer: {
    flex: 1,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 0.3,
  },
  confirmText: {
    fontSize: 20,
    color: '#CD4F39',
    fontWeight: 'bold',
  },
  modalPrivateKeyContainer: {
    height: 280,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 55,
    width: Dimensions.get('window').width - 60,
  },
  close: {
    width: 55,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalKeyTipContainer: {
    borderRadius: 5,
    padding: 3,
    paddingRight: 1,
    marginHorizontal: 25,
    marginBottom: 15,
    borderColor: '#CD6839',
    borderWidth: 0.5,
    backgroundColor: '#EED5D2',
    height: 63,
    width: Dimensions.get('window').width - 80,
  },
  modalKeyTipText: {
    color: '#CD4F39',
    fontSize: 16,
  },
  modalKeyContainer: {
    flex: 1,
    borderRadius: 5,
    padding: 5,
    marginHorizontal: 25,
    backgroundColor: '#C9C9C9',
    minHeight: 60,
    width: Dimensions.get('window').width - 80,
  },
  modalKeyText: {
    color: 'black',
    fontSize: 16,
  },
  copyButton: {
    borderRadius: 5,
    marginTop: 15,
    height: 40,
    width: Dimensions.get('window').width - 80,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#EEE',
  },
  saveText: {
    height: 50,
    paddingRight: 10,
    paddingLeft: 20,
    color: '#00ff00',
    fontSize: 16,
    textAlignVertical: 'center',
  },
  topContainer: {
    alignItems: 'center',
  },
  icon: {
    marginTop: 30,
    height: 77,
    width: 62
  },
  ethText: {
    marginVertical: 5,
    fontWeight: 'bold',
    fontSize: 18,
  },
  accountText: {
    fontSize: 16,
    color: '#B0B0B0',
  },
  middleContainer: {
    marginTop: 15,
    paddingTop: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white'
  },
  line: {
    width: Dimensions.get('window').width  - 20,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
  },
  text: {
    textAlignVertical: 'center',
    fontSize: 16,
    color: '#8E8E8E',
    height: 30,
  },
  bottomContainer: {
    marginVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white'
  },
});
