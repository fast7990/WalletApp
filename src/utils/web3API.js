import axios from 'axios'
import {AsyncStorage} from 'react-native'
import SQLUtils from './SQLUtils'
let sqlite = new SQLUtils()
import storage from './AsyncStorageUtil'
class APIUtils {
  constructor(global_keystore = null,
              tokenContract = null,
              nodejs_server = 'http://47.104.7.39',
              chain_server = '',
              keystore = '',
              nKeystore = '',
              AccountName = ''
  ) {
    this.global_keystore = global_keystore
    this.tokenContract = tokenContract
    this.nodejs_server = nodejs_server
    this.chain_server = chain_server
    this.keystore = keystore
    this.nKeystore = nKeystore
    this.AccountName = AccountName
  }

  //axios
  register() {
    if ($("#user_mobile").val() == "") {
      alert("请输入手机号");
      return;
    }
    if ($("#password").val() == "") {
      alert("请输入密码!");
      return;
    }
    if ($("#password2").val() != $("#password2").val()) {
      alert("密码不一致，请重新请输入密码!");
      return;
    }
    var currentWallet = this.getCurrentWallet();//        "user_name":encodeURIComponent($(#"user_name").val()),
    var url = this.nodejs_server + "/action.do?actname=register&account_hash=" + currentWallet;//application/json
    var option = {
      "account_hash": currentWallet,
      "login_name": $("#login_name").val(),
      "password": $("#password").val(),
      "user_mobile": $("#user_mobile").val(),
    }
    return axios({
      method: 'post',
      url,
      data: option
    })
  }

  //axios
  login(login_name, password) {
    var currentWallet = this.getCurrentWallet();
    var url = nodejs_server + "/action.do?actname=login&account_hash=" + currentWallet;//application/json
    var option = {"account_hash": currentWallet, "user_name": login_name, "password": password}
    return axios({
      method: 'post',
      url,
      data: option
    })
  }
  getShortAccount(account) {
    if (account != undefined) {
      account = account.substring(0, 5) + "..." + account.substring(account.length - 5, account.length);
      return account;
    }else{
      return "账户串异常";
    }
  }
  getShortAccount2(account) {
    if (account != undefined) {
      account = account.substring(0, 9) + "..." + account.substring(account.length - 9, account.length);
      return account;
    }else{
      return "账户串异常";
    }
  }

  validateNumber(data){
    let myreg = /^(-?\d+)(\.\d+)?$/
    if (!myreg.test(data)) {
      return false;
    } else {
      return true;
    }
  }

  validatePone(pone) {
    let myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
    if (!myreg.test(pone)) {
      return false;
    } else {
      return true;
    }
  }

  validateCardNum(cardnum){
    let myreg = /(^\d{15}$)|(^\d{17}([0-9]|X)$)/;
    if (!myreg.test(cardnum)) {
      return false;
    } else {
      return true;
    }
  }

  validateIfEmpty(data){
    if(data == null || data == ''){
      return false;
    }
    return true;
  }
  //storage
  validateName(account_name) {
    if (account_name == null) {
      return false;
    }
    if (account_name.length < 4) {
      return false;
    }
    return true;
  }

  //?
  validateToken(account, amount) {
    if (!this.web3.isConnected()) {
      return '';
    }
    try {
      var vAccount = this.tokenContract.balanceOf(account);
      if (amount < vAccount) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return e.message;
    }
  }

  //pure
  validateAccount(address) {
    if(!(address.substring(0,2) === "0x")){
      return false
    }else if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
      // check if it has the basic requirements of an address
      return false;
    } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
      // If it's all small caps or all all caps, return true
      return true;
    } else {
      // Otherwise check each case
      return false;
    }
  }
  //pure
  validatePassword(Password) {
    if (Password == null) {
      return false;
    }
    if (Password.length < 6) {
      return false;
    }
    if (!/^[0-9a-f]{6}$/i.test(Password)) {
      // check if it has the basic requirements of an address
      return false;
    } else if (/^[0-9a-f]{6}$/.test(Password) || /^[0-9A-F]{6}$/.test(Password)) {
      // If it's all small caps or all all caps, return true
      return true;
    } else {
      // Otherwise check each case
      return false;
    }
    return true;
  }
  //pure
  loadWallet(vAccountName, vKeyStore) {

  }
  //pure
  outPrint(vOut) {
    console.log(vOut);
  }
  //axios
  putInfo(option, wallet) {
    var url = this.nodejs_server + "/action.do?actname=putinfo&account_hash=" + wallet.account;
    let action = {
      from_account: wallet.account,
      actionname : 'putinfo',
      option: JSON.stringify(option),
      opttime : Date.now()
    }
    sqlite.insertActionHistory(action).then((msg)=>{
      console.log(msg)
    }).catch((err)=>{
      console.log(err)
    })
    return axios({
      method: 'post',
      url,
      data: option
    })
    return axios({
      method: 'post',
      url,
      data: option
    })
  }
  //axios
  queryInfo(wallet, keyStore, user_card, user_mobile, password) {
    /*
    var currentWallet = this.getCurrentWallet();
    var wallet = this.getWalletbyAccount(currentWallet);
    */
    var url = this.nodejs_server + "/action.do?actname=queryinfo&account_hash=" + wallet.account;//application/json
    var option = {
      "keystore": JSON.stringify(keyStore),
      "account_hash": wallet.account,
      "user_card": user_card,
      "password": password,
      "user_mobile": user_mobile
    }
    let ontionRecord = {
      "account_hash": wallet.account,
      "user_card": user_card,
      "user_mobile": user_mobile
    }
    let action = {
      actionname : 'queryinfo',
      option: JSON.stringify(ontionRecord),
      opttime : Date.now()
    }
    sqlite.insertActionHistory(action).then((msg)=>{
      console.log(msg)
    }).catch((err)=>{
      console.log(err)
    })
    return axios({
      method: 'post',
      url,
      data: option
    })
  }
  importWallet(account_name, password, keystore) {
    var account = "";
    var url = this.nodejs_server + "/action.do?actname=importwallet&account_hash=" + account;
    var option = {
      "account_hash": account,
      "account_name": account_name,
      "password": password,
      "keystore": JSON.stringify(keystore)
    }
    let ontionRecord = {
      "account_hash": account,
      "account_name": account_name
    }
    let action = {
      actionname : 'importwallet',
      option: JSON.stringify(ontionRecord),
      opttime : Date.now()
    }
    sqlite.insertActionHistory(action).then((msg)=>{
      console.log(msg)
    }).catch((err)=>{
      console.log(err)
    })
    return axios({
      method: 'post',
      url,
      data: option,
      headers: {
        'content-type': 'application/json;charset=utf-8'
      }
    })
  }
  //axios
  newWallet(account_name, password) {
    let account = ""
    let url = this.nodejs_server + "/action.do?actname=newwallet&account_hash=" + account
    let option = {
      "account_hash": account,
      "password": password,
      "account_name": account_name
    };
    let ontionRecord = {
      "account_hash": account,
      "account_name": account_name
    }
    let action = {
      actionname : 'newwallet',
      option: JSON.stringify(ontionRecord),
      opttime : Date.now()
    }
    sqlite.insertActionHistory(action).then((msg)=>{
      console.log(msg)
    }).catch((err)=>{
      console.log(err)
    })
    return axios({
      method: 'post',
      url,
      data: option,
      headers: {
        'content-type': 'application/json;charset=utf-8'
      }
    })
  }
  //axios
  getBalances(account) {
    if (account == "") {
      return;
    }
    var url = this.nodejs_server + "/action.do?actname=getbalance&account_hash=" + account;
    var option = {
      "account_hash": account,
      "account": account
    };
    return axios({
      method: 'post',
      url,
      data: option
    })
  }
  //axios
  sendEth(keystore,from_account, to_account, password, amount, memo) {
    if (to_account == '') {
      alert('请输入接收帐号地址');
      return false;
    }
    let url = this.nodejs_server + "/action.do?actname=sendeth&account_hash=" + from_account;
    let option = {
      "account_hash": from_account,
      "password": password,
      "from_account": from_account,
      "to_account": to_account,
      "amount": amount,
      "memo": memo,
      "keystore": keystore
    };
    let optionString = JSON.stringify(option)
    let action = {
      from_account: from_account,
      to_account: to_account,
      actionname : 'sendeth',
      option: optionString,
      opttime : Date.now()
    }
    sqlite.insertActionHistory(action).then((msg)=>{
      console.log(msg)
    }).catch((err)=>{
      console.log(err)
    })
    return axios({
      method: 'post',
      url,
      data: option
    })
  }
  sendToken(keystore,from_account, to_account, password, amount, memo) {
    if (to_account == '') {
      alert('请输入接收帐号地址');
      return false;
    }
    var url = this.nodejs_server + "/action.do?actname=sendtoken&account_hash=" + from_account;
    var option = {
      "account_hash": from_account,
      "password": password,
      "from_account": from_account,
      "to_account": to_account,
      "amount": amount,
      "memo": memo,
      "keystore": keystore
    };//JSON.stringify( wallet.keystore)
    let optionString = JSON.stringify(option)
    let action = {
      from_account: from_account,
      to_account: to_account,
      actionname : 'sendtoken',
      option: optionString,
      opttime : Date.now()
    }
    sqlite.insertActionHistory(action).then((msg)=>{
      console.log(msg)
    }).catch((err)=>{
      console.log(err)
    })
    return axios({
      method: 'post',
      url,
      data: option
    })
  }
}

export default APIUtils