const eth = require('./eth/ethereumjs-wallet/ethereumjs-wallet-0.6.0.min');
const bip39 = require('./bip39/bip39');
import { generateSecureRandom } from 'react-native-securerandom';
const Decimals=4;
let option = {
  "account_hash": "",
  "from_account": "",
  "actionname":"",
  "to_account": "",
  "singdata":"",
  "amount": 0
};
let nodejs_server = 'http://192.168.0.109';
let vChain_server = 'http://192.168.0.109';

exports.getContractDecimals=()=> {
  return Decimals;
}
exports.convert2Save=(vValue)=> {
  return vValue*10000;
}
exports.convert2Show=(vValue)=> {
  return vValue/10000;
}
exports.getServer = ()=>{
  return nodejs_server;
}

exports.getEthBalance = (address)=>{

}

exports.getValidKeyStore=(vKeyStore)=>
{
  if(vKeyStore.indexOf("\\")>-1){
    try{
      return JSON.parse(vKeyStore);
    }catch(ex) {
      vKeyStore=vKeyStore.replace("\\", '');
      return JSON.parse(vKeyStore);
    }
  }else{
    return vKeyStore;
  }
}

exports.getKeysoreByMnemonic=(account_name,vMnemonic,vPassword) =>{
  return new Promise((resolve,reject)=> {
    try{
      if (bip39.validateMnemonic(vMnemonic)) {
        var pri = bip39.mnemonicToEntropy(vMnemonic);
        var bPrivate = eth.Buffer.Buffer.from(pri, 'hex');
        var instance = eth.Wallet.fromPrivateKey(bPrivate);
        console.log(instance);
        var keystore = instance.toV3(vPassword);
        account="0x"+instance.getAddress().toString("hex");
        console.log("0x" + pri + "   " + JSON.stringify(keystore));
      } else {
        console.log("非法字符");
        // Error error=throw new Error("newWallet 非法字符");;
        // reject(throw new Error("newWallet 非法字符")) ;
      }
      var vRef = {"account":account,"name":account_name,"privatekey": "0x" + pri, "mnemonic": "", "keystore":JSON.stringify(keystore)};
      resolve(vRef);
    }catch(error) {
      // console.log("newWallet error: " + error.message);
      reject(error);
    }
  });
}

exports.getMnemonicByKeysore=(vKeyStore,passowrd) =>{
  return new Promise((resolve,reject)=> {
    try{
      var instance = eth.Wallet.fromV3(vKeyStore, passowrd);
      var privateKey = instance.getPrivateKey();
      if (privateKey != null) {
        vPrivatekey = new eth.Buffer.Buffer(privateKey, 'hex');
        var mnemonic = bip39.entropyToMnemonic(vPrivatekey)
        resolve(mnemonic) ;
      }
    }catch(error){
      console.log("importwallet error: "+error.message);
      reject(error) ;
    }
  });
}

exports.getPrivateKeyByKeysore=(vKeyStore,passowrd) =>{
  return new Promise((resolve,reject)=> {
    try{
      var instance = eth.Wallet.fromV3(vKeyStore, passowrd);
      var privateKey = instance.getPrivateKey();
      if (privateKey != null) {
        console.log(privateKey)
        resolve("0x"+privateKey.toString("hex")) ;
      }else{
        reject("error") ;
      }
    }catch(error){
      console.log("importwallet error: "+error.message);
      reject(error) ;
    }
  });
}
exports.importPrivateKey=(account_name,vPrivateKey,password) =>{
  return new Promise((resolve,reject)=> {
    try{
      if(vPrivateKey.substr(0,2)=="0x"){
        vPrivateKey=vPrivateKey.substr(2,vPrivateKey.length);
      }
      var bPrivate = eth.Buffer.Buffer.from(vPrivateKey, 'hex');
      var instance = eth.Wallet.fromPrivateKey(bPrivate);
      console.log(instance);
      var keystore = instance.toV3(password);
      account="0x"+instance.getAddress().toString("hex");
      console.log("0x" + vPrivateKey + "   " + JSON.stringify(keystore));
      // } else {
      //    console.log("非法字符");

      //  }
      var vRef = {"account":account,"name":account_name,"privatekey": "", "mnemonic": "", "keystore":JSON.stringify(keystore)};
      resolve(vRef);
    }catch  (error)  {
      console.log("newWallet error: " + error.message);
      reject(error);
    }
  });
}
exports.importPMnemonicy=(mnemonic,password) =>{
  return new Promise((resolve,reject)=> {
    try{
      if (bip39.validateMnemonic(mnemonic)) {
        var pri = bip39.mnemonicToEntropy(mnemonic)
        var bPrivate = eth.Buffer.Buffer.from(pri, 'hex');
        var instance = eth.Wallet.fromPrivateKey(bPrivate);
        console.log(instance);
        var keystore = instance.toV3(password);
        account="0x"+instance.getAddress().toString("hex");
        console.log("0x" + pri + "   " + JSON.stringify(keystore));
      } else {
        console.log("非法字符");

      }
      var vRef = {"account":account,"name":"","privatekey": "0x" + pri, "mnemonic": mnemonic, "keystore":JSON.stringify(keystore)};
      resolve(vRef);
    }catch  (error)  {
      console.log("newWallet error: " + error.message);
      reject(error);
    }
  });
}

exports.newwallet=(account_name,password) =>{
  return new Promise((resolve,reject)=> {
    try{
      generateSecureRandom(32).then((privateBytes) => {
        var privatekey = new eth.Buffer.Buffer(privateBytes, 'hex');
        var mnemonic = bip39.entropyToMnemonic(privatekey)
        var account="";
        //console.log(mnemonic);
        if (bip39.validateMnemonic(mnemonic)) {
          var pri = bip39.mnemonicToEntropy(mnemonic)
          var bPrivate = eth.Buffer.Buffer.from(pri, 'hex');
          var instance = eth.Wallet.fromPrivateKey(bPrivate);
          console.log(instance);
          var keystore = instance.toV3(password);
          account="0x"+instance.getAddress().toString("hex");
          console.log("0x" + pri + "   " + JSON.stringify(keystore));
        } else {
          console.log("非法字符");

        }
        var vRef = {"account":account,"name":account_name,"privatekey": "0x" + pri, "mnemonic": mnemonic, "keystore":JSON.stringify(keystore)};
        resolve(vRef);
      });
    }catch  (error)  {
      console.log("newWallet error: " + error.message);
      reject(error);
    }
  });
};
exports.importwallet=(account_name,vKeyStore,passowrd) =>{
  return new Promise((resolve,reject)=>{
    try{
      var instance = eth.Wallet.fromV3(vKeyStore, passowrd);
      var privateKey = instance.getPrivateKey();
      if (privateKey != null) {
        var mnemonic = bip39.entropyToMnemonic(privateKey);
        var addr = instance.getAddress().toString("hex");
        var vRef={"account":"0x"+addr,"privatekey":"0x"+privateKey.toString("hex"),"mnemonic":mnemonic,"name":account_name,"keystore":(vKeyStore)};//JSON.stringify
        resolve(vRef) ;
      }
    }catch(error){
      console.log("importwallet error: "+error.message);
      reject(error) ;
    }
  });
};

