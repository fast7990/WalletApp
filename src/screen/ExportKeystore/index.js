import React, {Component} from 'react';
import {StyleSheet, Text, View, TextInput, Clipboard, ToastAndroid, ScrollView, Dimensions} from 'react-native';
import TitleBar from '../../components/TitleBar'
import SubmitButton from '../../components/SubmitButton'
import SQLiteUtils from '../../utils/SQLiteUtils';
let sqlite = new SQLiteUtils();
import web3API from '../../utils/web3API';
let web3 = new web3API();

export default class ExportKeystore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keystore: '',
    }
  }

  componentDidMount = () => {
    this.getKeystore();
  }

  getKeystore(){
    sqlite.getCurrentWallet().then((data)=>{
      if(data == null){
        ToastAndroid.show('未存入数据！', ToastAndroid.SHORT);
      }else {
        this.setState({keystore: data.keystore})
      }
    }).catch((err)=>{
      console.log(err);
    })
  }

  onPressCopyStore() {
    Clipboard.setString(this.state.keystore);
    ToastAndroid.show('已复制到剪贴板', ToastAndroid.SHORT);
    this.props.navigation.goBack();
  }

  renderItem(title) {
    let tip = '';
    if(title == '离线保存'){
      tip = '请复制黏贴Keystore文件到安全、离线的地方保存。切勿保存至邮箱、记事本、网盘、聊天工具等，非常危险';
    }else if(title == '请勿使用网络传输'){
      tip = '请勿通过网络工具传输Keystore文件，一旦被黑客获取将造成不可挽回的财产损失。建议离线设备通过扫二维码方式传输。';
    }else if(title == '密码保险箱保存') {
      tip = '如需在线保存，则建议使用安全等级高的1Password等密码保管软件保存Keystore';
    }
    return(
      <View style={styles.itemContainer}>
        <Text style={styles.titleText}>{title}</Text>
        <Text style={styles.tipText}>{tip}</Text>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <TitleBar title='导出Keystore' type='0'/>
        <ScrollView>
          <View>
            {this.renderItem('离线保存')}
            {this.renderItem('请勿使用网络传输')}
            {this.renderItem('密码保险箱保存')}
            <View style={styles.keyContainer}>
              <Text style={styles.keyText}>{this.state.keystore}</Text>
            </View>
          </View>
        </ScrollView>
        <SubmitButton enable buttonText={'复制keyStore'} style={styles.copyButton} onPressButton={this.onPressCopyStore.bind(this)}/>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between'
  },
  itemContainer: {
    marginVertical: 5,
    marginHorizontal: 15,
  },
  titleText: {
    fontSize: 18,
    color: 'blue',
    fontWeight: 'bold',
  },
  tipText: {
    fontSize: 17,
    color: 'gray',
  },
  keyContainer: {
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 10,
    paddingRight: 5,
    marginHorizontal: 15,
    backgroundColor: '#C9C9C9',
  },
  keyText: {
    color: 'black',
    fontSize: 16,
  },
  copyButton: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
});