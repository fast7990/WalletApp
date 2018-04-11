var axios=require('axios');
var Alert=require("react-native");
var Tx = require('ethereumjs-tx');
var ethUtil = require("ethereumjs-util");
var cryptojs = require("cryptojs");
var Crypto = cryptojs.Crypto;
var eWallet = require('ethereumjs-wallet');
var bip39 = require('bip39');

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
exports.getKeysoreByMnemonic=(vMnemonic,vPassword) =>{
    return new Promise((resolve,reject)=> {
        try{
            if (bip39.validateMnemonic(vMnemonic)) {
                var pri = bip39.mnemonicToEntropy(vMnemonic);
                var bPrivate = Buffer.from(pri, 'hex');
                var instance = eWallet.fromPrivateKey(bPrivate);
                console.log(instance);
                var keystore = instance.toV3(vPassword);
                account="0x"+instance.getAddress().toString("hex");
                console.log("0x" + pri + "   " + JSON.stringify(keystore));
            } else {
                console.log("非法字符");
                // Error error=throw new Error("newWallet 非法字符");;
                // reject(throw new Error("newWallet 非法字符")) ;
            }
            var vRef = {"account":account,"name":"","privatekey": "0x" + pri, "mnemonic": vMnemonic, "keystore":JSON.stringify(keystore)};
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
            var instance = eWallet.fromV3(vKeyStore, passowrd);
            var privateKey = instance.getPrivateKey();
            if (privateKey != null) {
                vPrivatekey = new Buffer(privateKey, 'hex');
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
            var instance = eWallet.fromV3(vKeyStore, passowrd);
            var privateKey = instance.getPrivateKey();
            if (privateKey != null) {
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
exports.importPrivateKey=(vPrivateKey,password) =>{
    return new Promise((resolve,reject)=> {
        try{
            if(vPrivateKey.substr(0,2)=="0x"){
                vPrivateKey=vPrivateKey.substr(2,vPrivateKey.length);
            }
               var bPrivate = Buffer.from(vPrivateKey, 'hex');
                var instance = eWallet.fromPrivateKey(bPrivate);
                console.log(instance);
                var keystore = instance.toV3(password);
                account="0x"+instance.getAddress().toString("hex");
                console.log("0x" + vPrivateKey + "   " + JSON.stringify(keystore));
           // } else {
            //    console.log("非法字符");

          //  }
            var vRef = {"account":account,"name":"","privatekey": "0x" + pri, "mnemonic": mnemonic, "keystore":JSON.stringify(keystore)};
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
                var bPrivate = Buffer.from(pri, 'hex');
                var instance = eWallet.fromPrivateKey(bPrivate);
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

exports.newwallet=(password) =>{
    return new Promise((resolve,reject)=> {
        try{
            var privateBytes = Crypto.util.randomBytes(32);
            var privatekey = new Buffer(privateBytes, 'hex');
            var mnemonic = bip39.entropyToMnemonic(privatekey)
            var account="";
            //console.log(mnemonic);
            if (bip39.validateMnemonic(mnemonic)) {
                var pri = bip39.mnemonicToEntropy(mnemonic)
                var bPrivate = Buffer.from(pri, 'hex');
                var instance = eWallet.fromPrivateKey(bPrivate);
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
};
exports.importwallet=(vKeyStore,passowrd) =>{
    return new Promise((resolve,reject)=>{
        try{
            var instance = eWallet.fromV3(vKeyStore, passowrd);
            var privateKey = instance.getPrivateKey();
            if (privateKey != null) {
                var mnemonic = bip39.entropyToMnemonic(privateKey);
                var addr = instance.getAddress().toString("hex");
                var vRef={"account":"0x"+addr,"privatekey":"0x"+privateKey.toString("hex"),"mnemonic":mnemonic,"name":"","keystore":(vKeyStore)};//JSON.stringify
                resolve(vRef) ;
            }
        }catch(error){
            console.log("importwallet error: "+error.message);
            reject(error) ;
        }
    });
};
//================SendTx=============================
exports.sendTx=(vKeyStore, vPassowrd, vTo, vAmount)=>{
    return new Promise((resolve,reject)=>{
        try{
            var instance = eWallet.fromV3(vKeyStore, vPassowrd);
            var privateKey = instance.getPrivateKey();
            if (privateKey != null) {
                var from = instance.getAddress().toString("hex");
                option = {
                    "account_hash": from,
                    "from_account": from,
                    "actionname":"sendtx",
                    "to_account": vTo,
                    "singdata":"",
                    "amount": vAmount,
                };
                //ajax  send singData to server
                this.getTxJson(option).then((rawTx) => {
                    console.log(rawTx);
                    /* 私钥签名 ---------start--------------*/
                    const tx = new Tx(rawTx);
                    tx.sign(privateKey);
                    const serializedTx = tx.serialize();
                    var singData = "0x"+serializedTx.toString('hex');
                    option.singdata=singData;
                    //===========================
                    //ajax  send singData to server
                    this.sendSingData(option).then((result) => {
                        resolve(result) ;
                       // response.end( exports.getReturn(1, error.message,  null));
                    }).catch((error) => {
                        reject(error);
                        // response.end( exports.getReturn(0, error.message,  null));
                    });

                }).catch((error) => {
                    console.log("error："+error);
                    reject(error);
                    // response.end( exports.getReturn(0, error.message,  null));
                });
            }
        }catch(ex) {
            reject(ex);
        }
    });
}
exports.sendSingData=(option)=>{
    return new Promise((resolve,reject)=>{
        var url = this.nodejs_server + "/action.do?actname=sendsingdata&account_hash=" + from;
        axios({
            method: 'post',
            url,
            data: option
        }).then((msg) => {
            resolve(msg);
        }).catch((err) => {
            Alert.alert("发生意外错误！");
            reject(err);
        })
    });
}
exports.getTxJson=(option)=>{
return new Promise((resolve,reject)=>{

         var url = this.nodejs_server + "/action.do?actname=gettxjson&account_hash=" + option.from_account;
        axios({
            method: 'post',
            url,
            data: option
        }).then((msg) => {
            resolve(msg);
        }).catch((err) => {
            Alert.alert("发生意外错误！");
            reject(err);
        });;
    });

}
exports.getTokenTxJson=(option)=>{
    return new Promise((resolve,reject)=>{
       // resolve(this.getTokenTx(option.from_account,option.to_account,option.amount));
      var url = this.nodejs_server + "/action.do?actname=gettokentxjson&account_hash=" + option.from_account;
        axios({
            method: 'post',
            url,
            data: option
        }).then((msg) => {
            resolve(msg);
        }).catch((err) => {
            Alert.alert("发生意外错误！");
            reject(err);
        });
    });
}
exports.VeryfyAccount=(vKeyStore, vPassowrd)=> {
    return new Promise((resolve,reject)=>{
        try{
            resolve( eWallet.fromV3(vKeyStore, vPassowrd));
        }catch(ex) {
            reject(ex);
        }
    });
}
exports.sendTokenTx=(vKeyStore, vPassowrd, vTo, vAmount)=> {
    return new Promise((resolve,reject)=>{
        try{
            var instance = eWallet.fromV3(vKeyStore, vPassowrd);
            var privateKey = instance.getPrivateKey();
            if (privateKey != null) {
                var from = instance.getAddress().toString("hex");
                option = {
                    "account_hash": from,
                    "from_account": from,
                    "actionname":"sendtokentx",
                    "to_account": vTo,
                    "singdata":"",
                    "amount": vAmount,
                    opttime : Date.now()
                };
                this.getTokenTxJson(option).then((rawTx) =>{
                    console.log(rawTx);
                    /* 私钥签名 ---------start--------------*/
                    const tx = new Tx(rawTx);
                    tx.sign(privateKey);
                    const serializedTx = tx.serialize();
                    var singData = "0x"+serializedTx.toString('hex');
                    option.singdata=singData;
                    //===========================
                    //ajax  send singData to server
                    this.sendSingData(option).then((result) => {
                        let optionString = JSON.stringify(option)
                        let action = {
                            from_account: from,
                            to_account: vTo,
                            actionname : 'sendeth',
                            option: optionString,
                            opttime : Date.now()
                        }
                        sqlite.insertActionHistory(action).then((msg)=>{
                            console.log(msg)
                        }).catch((err)=>{
                            console.log(err)
                        })
                        response.end( exports.getReturn(1, error.message,  null));
                    }).catch((error) => {
                        console.log(error);
                        reject(error);
                        // response.end( exports.getReturn(0, error.message,  null));
                    });
                }).catch((error) =>{
                    console.log(error);
                    reject(error);
                    // response.end( exports.getReturn(0, error.message,  null));
                });
            // resolve( this.sendTxByPri(privateKey,"0x"+from,contract_Addr,funData));
            }
        }catch(ex) {
            reject(ex);
        }
    });
}

var keystore='{"address":"d1cc2a7ac904d7f510a9a7a7b54e23ae82671b2e","crypto":{"cipher":"aes-128-ctr","ciphertext":"1529f93d1d4dac5fbc8a9c67f8b43abaedc558be3fe5d584f69c50b74e7ecfdc","cipherparams":{"iv":"656a9a4bf8e7501d13aa79c444db5904"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"22cc471525cb8e174a923d10e1db5910047b9e4fdc444bbddd142252f4ef1a26"},"mac":"f1bc533b29e84349d2dbc21336b5f07cf8c39b2b277ba5cfdcf883b7d2d4397c"},"id":"433898e3-0610-4734-8bd2-ccda6699e1e8","version":3}';
var passowrd="1234";


/*this.getMnemonicByKeysore(keystore,passowrd).then((result) => {
    console.log(result);
}).catch((error) => {
    // response.end( exports.getReturn(0, error.message,  null));
});*/
/*this.importwallet(keystore,passowrd).then((result) => {
    console.log(result);
}).catch((error) => {
    // response.end( exports.getReturn(0, error.message,  null));
});*/
/*vMnemonic="pool hamster cover eyebrow timber tape picnic inhale imitate very upon oxygen midnight wrong vivid enlist oven whip satoshi bunker evoke filter shrug print";
this.getKeysoreByMnemonic(vMnemonic,passowrd).then((result) => {
    console.log(result);
}).catch((error) => {
    // response.end( exports.getReturn(0, error.message,  null));
});*/

/*this.getPrivateKeyByKeysore(keystore,passowrd).then((result) => {
    console.log(result);
}).catch((error) => {
    // response.end( exports.getReturn(0, error.message,  null));
});*/

 var privatekey="0xa80d14c628ae23bba90b9d717e5fbbcf28c7fd7d4a569ddf4efd8f34e0acf1d5";
 this.importPrivateKey(privatekey,passowrd).then((result) => {
     console.log(result);
 }).catch((error) => {
     // response.end( exports.getReturn(0, error.message,  null));
 });

/*var mnemonic="pool hamster cover eyebrow timber tape picnic inhale imitate very upon oxygen midnight wrong vivid enlist oven whip satoshi bunker evoke filter shrug print";
this.importPMnemonicy(mnemonic,passowrd).then((result) => {
      console.log(result);
  }).catch((error) => {
      // response.end( exports.getReturn(0, error.message,  null));
  });*/

/*this.sendTx(keystore, passowrd, "0xbb42a58c7a922682a4f6765ebda39afd2b1b4b50", 100).then((result) => {
     console.log(result);
}).catch((error) => {
    // response.end( exports.getReturn(0, error.message,  null));
});*/
/*
 this. sendTokenTx(keystore, passowrd, "0xbb42a58c7a922682a4f6765ebda39afd2b1b4b50", 100).then((result) => {
     console.log(result);
 }).catch((error) => {
     // response.end( exports.getReturn(0, error.message,  null));
 });*/

