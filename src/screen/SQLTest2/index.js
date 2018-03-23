import React, {Component} from 'react';
import {
  AppRegistry,
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableHighlight
} from 'react-native'
import SQLUtils from '../../utils/SQLUtils'

let sqlite = new SQLUtils()

export default class SQLTest2 extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: ''
    }
  }

  componentWillUnmount = () => {
    console.log('数据库将关闭，数据将被删除')
    //关闭连接
    sqlite.close()
  }
  componentDidMount = () => {
    //开启数据库
    if (!sqlite.db) {
      sqlite.open()
    }
    console.log('数据库开启')
  }
  _onLocalName = () => {
    console.log(this.state.name)
  }
  _onAddWallet = () => {
    let data = {
      name: 'abc',
      account: '123432423',
      keystore: 'gre323fdg3223',
      privatekey: '0xa80d14c628ae23bba90b9d717e5fbbcf28c7fd7d4a569ddf4efd8f34e0acf1d5',
      mnemonic: 'pool hamster cover eyebrow timber tape picnic inhale imitate very upon oxygen midnight wrong vivid enlist oven whip satoshi bunker evoke filter shrug print'

    }
    sqlite.insertWallets(data).then((msg) => {
      if (msg == 1) {
        console.log("现在账户导入成功")
      } else {
        console.log("现在账户导入失败")
      }
    })
  }
  _onAdd_C_Wallet = () => {
    let data = {
      name: 'abc',
      account: '123432423',
      keystore: 'gre323fdg3223',
      privatekey: '0xa80d14c628ae23bba90b9d717e5fbbcf28c7fd7d4a569ddf4efd8f34e0acf1d5',
      mnemonic: 'pool hamster cover eyebrow timber tape picnic inhale imitate very upon oxygen midnight wrong vivid enlist oven whip satoshi bunker evoke filter shrug print',
    }
    sqlite.insertCurrentWallet(data).then((msg) => {
      if (msg == 1) {
        console.log("现在账户导入成功")
      } else {
        console.log("现在账户导入失败")
      }
    })
  }
  _onGet_C_Wallet = () => {
    sqlite.getCurrentWallet().then((data) => {
      console.log(data)
    })
  }
  _onGet_To_Acount = () => {

  }
  _onUpdate_C_Wallet = () => {
    let data = {
      name: 'fdskj321',
      account: '6666666666',
      keystore: '555555555',
      privatekey: '44444444444444444',
      mnemonic: 'pool hamster cover eyebrow timber tape picnic inhale imitate very upon oxygen midnight wrong vivid enlist oven whip satoshi bunker evoke filter shrug print',
    }
    sqlite.updateCurrentWallet(data).then((msg) => {
      if (msg == '1') {
        console.log('更新完成')
      } else {
        console.log('更新失败', msg)
      }
    })
  }
  _onFindWallets = () => {
    /*
    let len = wallets.rows.length
    for(let i =0;i<len;i++){
      let item = wallets.rows.item(i)
      console.log('name: '+item.name,'account: '+item.account,'keystore: '+item.keystore)
    }
    */
    sqlite.getAllWallets().then((wallets) => {
      console.log(wallets)
    }).catch(() => {
      console.log('得到所有钱包失败')
    })
    /*sqlite.db.transaction(
            (tx)=>{
        let sql = "select * from wallets"
        tx.executeSql(
          sql,[],(tx, results)=>{
            console.log('getAllWallets succeed')
            let len = results.rows.length;
            for(let i=0; i<len; i++){
                item = results.rows.item(i);
                console.log("name : "+item.name+". account :"+item.account+". keystore :" + item.keystore + ". mnemonic :" + item.mnemonic + ". privatekey :" +item.privatekey)
              this.setState({name : item.name})
            }
          },(err)=>{
            console.log(err)
          }
        )
            }
        )*/
  }
  _onDropTable = () => {

  }
  _onAddCurrentWallet = () => {
    let wallet = sqlite.getLastWallet()
    console.log(wallet)
  }
  _onFindCurrentWallet = () => {
    let wallet = sqlite.getCurrentWallet()
    console.log(wallet)
  }

  _onAddActionHistory = () => {
    let data1 = {
      from_account: '3333333',
      to_account: '555555555',
      actionname : '66666666',
      option: '777777777',
      resulttype: '1',
      resultmsg : 'aaaaaaaa',
      opttime : '5435345'
    }
    let data2 = {
      from_account: '3333333',
      to_account: '555555555',
      actionname : '66666666',
      option: '777777777'
    }
    sqlite.insertActionHistory(data2).then(()=>{
      console.log('插入记录成功')
    }).catch((err)=>{
      console.log(err)
    })
  }
  _onGetAllActionHistory = () => {
    sqlite.getAllActionHistory().then((data)=>{
      console.log(data)
    }).catch((err)=>{
      console.log(err)
    })
  }
  _onGetAllActionHistoryToAccount = () => {
    /*sqlite.getAllActionHistoryToAccount().then((data)=>{
      console.log(data)
    }).catch((err)=>{
      console.log(err)
    })*/
    sqlite.getSendEthToAccount().then((data)=>{
      console.log('getSendEthToAccount')
      console.log(data)
    }).catch((err)=>{
      console.log(err)
    })
    sqlite.getSendTokenToAccount().then((data)=>{
      console.log('getSendTokenToAccount')
      console.log(data)
    }).catch((err)=>{
      console.log(err)
    })
  }
  _onUpdateActionHistory = () => {
    sqlite.getAllActionHistory().then((histories)=>{
      console.log(histories)
      let data = {
        id : histories[histories.length - 1].id,
        resulttype: '2',
        resultmsg : 'bbbb',
        opttime : '111111111'
      }
      sqlite.updateActionHistory(data).then(()=>{
        console.log('更新成功')
      }).catch(()=>{
        console.log('更新失败')
      })
    }).catch((err)=>{
      console.log(err)
    })
  }

  render() {
    return (
      <View>
        <TouchableHighlight
          onPress={this._onAddWallet}
          style={{marginTop: 15}}
        >
          <Text>wallet提交</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._onFindWallets}
          style={{marginTop: 15}}
        >
          <Text>wallet查询</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._onFindWallets}
          style={{marginTop: 15}}
        >
          <Text>wallet删除</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._onLocalName}
          style={{marginTop: 15}}
        >
          <Text>本地</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._onAddActionHistory}
          style={{marginTop: 15}}
        >
          <Text>ahistory提交</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._onGetAllActionHistory}
          style={{marginTop: 15}}
        >
          <Text>ahistory查询所有</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._onGetAllActionHistoryToAccount}
          style={{marginTop: 15}}
        >
          <Text>ahistory查询地址</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._onUpdateActionHistory}
          style={{marginTop: 15}}
        >
          <Text>ahistory更新</Text>
        </TouchableHighlight>
      </View>
    )
  }
}