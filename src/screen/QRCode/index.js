import React, { Component } from 'react';
import {
  StyleSheet, Text, View, TextInput, FlatList, Image, TouchableHighlight, Clipboard,
  ToastAndroid
} from 'react-native';
import Dimensions from 'Dimensions';
import TitleBar from '../../components/TitleBar';
import QRCodeMaker from 'react-native-qrcode';
import SQLUtils from '../../utils/SQLUtils'
let sqlite = new SQLUtils()
import web3API from '../../utils/web3API'
let web3 = new web3API()

var ScreenWidth = Dimensions.get('window').width;
var ScreenHeight = Dimensions.get('window').height;
let lowerHeight = ScreenHeight-160-50;
export default class QRCode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wallet: {},
    };
  }
  componentDidMount = () => {
    sqlite.getCurrentWallet().then((data) => {
      //Alert.alert(data.account)
      console.log(data);
      this.setState({wallet: data});
      console.log(this.state.wallet)
    }).catch((err)=>{
      console.log(err)
    })
  }
  componentWillUnmount = () => {
    sqlite.close()
  }
  _onCopy=()=>{
    Clipboard.setString(this.state.wallet.account);
    ToastAndroid.show('已复制到剪贴板', ToastAndroid.SHORT);
  }
  render(){
    let width = Dimensions.get('window').width;
    let imageWidth = width - 120;
    return(
      <View>
        <TitleBar title='收款码' type='1' name='Home'/>
        <View style={styles.upperContainer}></View>
        <View style={styles.lowerContainer}>
          <View style={styles.contentContainer}>
            <View style={{padding:10}}>
            <QRCodeMaker
              value={this.state.wallet.account}
              size={imageWidth-20}
              bgColor='purple'
              fgColor='white'
            />
            </View>
            <Text>{"帐户名："+this.state.wallet.name}</Text>
            <Text>{this.state.wallet.account}</Text>
            <TouchableHighlight onPress={this._onCopy} style={{alignItems:"center",justifyContent:"center"}}>
              <Text>复制地址</Text>
            </TouchableHighlight>
          </View>
        </View>
      </View>
    )
  }
}

let styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEE',
  },
  upperContainer: {
    height:160,
    backgroundColor: 'gray',
  },
  lowerContainer:{
    height:lowerHeight,
    backgroundColor: 'white',
  },
  contentContainer: {
    marginTop:60,
    marginHorizontal:60,
    flex:1,
  },
  itemText:{

  }
});