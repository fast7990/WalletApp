import React, { Component } from 'react';
import { View, Text, WebView } from 'react-native';
const indexHtml = require('./web/index.html');
const LoacalWebURL = require('./web/index.html');
import web3Utils from '../../utils/web3Utils';


export default class MyWeb extends Component {
  onMessage(event) {
    //Prints out data that was passed.
    console.log(event.nativeEvent.data);
  }
  componentDidMount(){
    let keystore='{"address":"d1cc2a7ac904d7f510a9a7a7b54e23ae82671b2e","crypto":{"cipher":"aes-128-ctr","ciphertext":"1529f93d1d4dac5fbc8a9c67f8b43abaedc558be3fe5d584f69c50b74e7ecfdc","cipherparams":{"iv":"656a9a4bf8e7501d13aa79c444db5904"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"22cc471525cb8e174a923d10e1db5910047b9e4fdc444bbddd142252f4ef1a26"},"mac":"f1bc533b29e84349d2dbc21336b5f07cf8c39b2b277ba5cfdcf883b7d2d4397c"},"id":"433898e3-0610-4734-8bd2-ccda6699e1e8","version":3}';
    let password="1234";
    let vMnemonic="pool hamster cover eyebrow timber tape picnic inhale imitate very upon oxygen midnight wrong vivid enlist oven whip satoshi bunker evoke filter shrug print";
    let privatekey="0xa80d14c628ae23bba90b9d717e5fbbcf28c7fd7d4a569ddf4efd8f34e0acf1d5";

    /*web3Utils.getPrivateKeyByKeysore(keystore,password).then((privatekey)=>{
      console.log(privatekey);
    }).catch((err)=>{
      console.log(err);
    })
    web3Utils.importPrivateKey(privatekey,password).then((vRef)=>{
      console.log(vRef);
    }).catch((err)=>{
      console.log(err);
    })*/
    /*
    web3Utils.getKeysoreByMnemonic(vMnemonic,password).then((vRef)=>{
      console.log(vRef);
    }).catch((err)=>{
      console.log(err);
    })*/
    /*web3Utils.getMnemonicByKeysore(keystore,password).then((Mnemonic)=>{
      console.log(Mnemonic);
    }).catch((err)=>{
      console.log(err);
    })*/
    /*web3Utils.getPrivateKeyByKeysore(keystore,password).then((data)=>{
      console.log(data);
    }).catch((err)=>{
      console.log(err);
    })*/
    /*web3Utils.importPMnemonicy(vMnemonic,password).then((data)=>{
      console.log(data);
    }).catch((err)=>{
      console.log(err);
    })*/
    /*
    web3Utils.newwallet(password).then((data)=>{
      console.log(data);
    }).catch((err)=>{
      console.log(err);
    })*/
  }
  render() {
    console.log(LoacalWebURL);
    return (
        <WebView
          source={LoacalWebURL}
          style={{flex:1}}
          ref="webview"
          onMessage={this.onMessage}
        />
    );
  }
}