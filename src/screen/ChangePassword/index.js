import React, {Component} from 'react';
import {StyleSheet, Text, View, TextInput, Alert, ToastAndroid, TouchableOpacity} from 'react-native';
import TitleBar from '../../components/TitleBar'
import Line from "../../components/Line/index";

export default class ChangePassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPassword: '',
      password: '',
      confirmPassword: '',
    }
  }

  setCurrentPassword(text) {
    this.setState({currentPassword: text});
  }
  setPassword(text) {
    this.setState({password: text});
  }
  setConfirmPassword(text) {
    this.setState({confirmPassword: text});
  }

  onPressImport() {
    this.props.navigation.popToTop();
    this.props.navigation.navigate('ImportWallet');
  }

  onPressFinish(){
    this.props.navigation.goBack();
  }

  renderFinish() {
    let enableFinish = this.state.currentPassword && this.state.password && this.state.confirmPassword;
    return(
      <TouchableOpacity
        activeOpacity={0.2}
        disabled={!enableFinish}
        onPress={this.onPressFinish.bind(this)}
      >
        <Text style={[styles.finishText, enableFinish && styles.finishEnable]}>完成</Text>
      </TouchableOpacity>
    );
  }

  renderItem(text, password, changeInput) {
    return (
      <View>
        <View style={styles.itemContainer}>
          <Text style={styles.text}>{text}</Text>
          <TextInput
            style={styles.input}
            underlineColorAndroid="transparent"
            onChangeText={(text) => changeInput(text)}
            value={password}
            secureTextEntry
          />
        </View>
      </View>
    );
  }

  render() {
    //Todo当前账户地址
    let account =this.props.navigation.state.params.account;

    return (
      <View style={styles.container}>
        <TitleBar title='更改密码' type='0' renderRight={this.renderFinish()}/>
        <View style={styles.inputContainer}>
          {this.renderItem('当前密码', this.state.currentPassword, this.setCurrentPassword.bind(this))}
          <Line/>
          {this.renderItem('新密码', this.state.password, this.setPassword.bind(this))}
          <Line/>
          {this.renderItem('重复新密码', this.state.confirmPassword, this.setConfirmPassword.bind(this))}
          <Line/>
          <TouchableOpacity activeOpacity={0.2}  onPress={this.onPressImport.bind(this)}>
            <View style={styles.tipContainer}>
              <Text style={styles.tipMassage}>忘记密码？ 导入助记词或私钥可重置密码。</Text>
              <Text style={styles.tipImport}>马上导入</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  finishText: {
    height: 50,
    paddingRight: 10,
    paddingLeft: 20,
    color: 'gray',
    fontSize: 16,
    textAlignVertical: 'center',
  },
  finishEnable: {
    color: '#00ff00',
  },
  inputContainer: {
    marginTop: 50,
  },
  itemContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
  },
  text: {
    height: 50,
    width: 90,
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
  tipContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginTop: 10,
  },
  tipMassage: {
    fontSize: 15,
    color: 'gray',
  },
  tipImport: {
    marginLeft: 10,
    fontSize: 16,
    color: '#5CACEE',
    fontWeight: 'bold',
  },
});