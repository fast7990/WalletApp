import SQLiteStorage from 'react-native-sqlite-storage'
SQLiteStorage.DEBUG(true)
import Singleton from './Singleton';
let single = new Singleton();

class SQLiteUtils {
  constructor(database_name = "test.db",
              database_version = "1.0",
              database_displayname = "MySQLite",
              database_size = -1,
              ) {
    this.database_name = database_name
    this.database_version = database_version
    this.database_displayname = database_displayname
    this.database_size = database_size
  }
  open() {
    //开启数据库
    let db = single.getDB();
    if (db) {
      return true;
    }
    console.log('数据库开启')

    let dbNew = SQLiteStorage.openDatabase(
      this.database_name,
      this.database_version,
      this.database_displayname,
      this.database_size,
      () => {
        this._successCB('open')
        return true;
      },
      (err) => {
        this._errorCB('open', err)
        return false;
      }
    )
    single.setDB(dbNew);
    return;
  }
  close() {
    try {
      let db = single.getDB();
      if (db) {
        this._successCB('close');
        db.close();
      } else {
        console.log("SQLiteStorage not open");
      }
      single.setDB(null);
    } catch (err) {
      console.log(err);
    }
  }
  _successCB(name) {
    console.log("SQLiteStorage " + name + " success")
  }
  _errorCB(name, err) {
    console.log("SQLiteStorage " + name)
    console.log(err)
  }
  //建表
  createTableWallets() {
    this.open()
    let db = single.getDB();
    db.transaction((tx) => {
        tx.executeSql('CREATE TABLE IF NOT EXISTS WALLETS(' +
          'id INTEGER PRIMARY KEY  AUTOINCREMENT,' +
          'name VARCHAR,' +
          'account VARCHAR,' +
          'mnemonic VARCHAR,' +
          'privatekey VARCHAR,' +
          'keystore VARCHAR)'
          , [], () => {
            this._successCB('createTableWallets')
          }, (err) => {
            this._errorCB('createTableWallets', err)
          })
      }, (err) => {
        this._errorCB('transaction', err)
      }, () => {
        this._successCB('transaction')
      }
    )
  }
  //插入数据
  insertWallets(data) {
    return new Promise((resolve, reject) => {
      this.open();
      let db = single.getDB();
      try {
        this.createTableWallets()
      } catch (err) {
        console.log(err)
      }

      db.transaction(
        (tx) => {
          let name = data.name
          let account = data.account
          let keystore = data.keystore
          let privatekey = data.privatekey
          let mnemonic = data.mnemonic
          let sql = "INSERT INTO WALLETS(name, account, keystore, privatekey, mnemonic)" +
            "values(?,?,?,?,?)"
          tx.executeSql(
            sql, [name, account, keystore, privatekey, mnemonic], () => {
              console.log('insertDataAllWallets succeed');
              resolve("1");
            }, (err) => {
              console.log(err);
              reject(err.toString());
            }
          )

        }, (error) => {
          this._errorCB('transaction', error)
        }, () => {
          this._successCB('transaction insert data')
        }
      )
    });
  }

  getAllWallets() {
    return new Promise((resolve, reject) => {
      this.open();
      let db = single.getDB();
      db.transaction(
        (tx) => {
          let sql = "select * from wallets"
          tx.executeSql(
            sql, [], (tx, results) => {
              console.log('getAllWallets succeed')
              let wallets = []
              for (let i = 0; i < results.rows.length; i++) {
                wallets.push(results.rows.item(i))
              }
              //关闭连接
              //this.close();
              resolve(wallets);
              //this.httpRequest2(item.account)
            }, (err) => {
              console.log(err);
              reject(err)
            }
          )
        }
      )
    })
  }

  getWalletByIndex(index) {
    return new Promise((resolve, reject) => {
      this.open();
      let db = single.getDB();
      db.transaction(
        (tx) => {
          let sql = "select * from wallets "
          tx.executeSql(
            sql, [], (tx, results) => {
              console.log('getWalletByIndex succeed' + results.rows.length)
              //  item = results.rows.item(0);
              if (index < results.rows.length) {
                resolve(results.rows.item(index));
              }
              // console.log("name : "+item.name+". account :"+item.account+". keystore :"+item.keystore)
            }, (err) => {
              console.log(err);
              reject(err)
            }
          )
        }
      )
    })
  }

  getWalletByAccount(account) {
    return new Promise((resolve, reject) => {
      this.open();
      let db = single.getDB();
      db.transaction(
        (tx) => {
          let sql = "select * from wallets where account=?";
          tx.executeSql(
            sql, [account], (tx, results) => {
              console.log('getWalletByAccount ' + account + ' succeed' + results.rows.length)
              if (results != null) {
                resolve(results.rows.item(0));
              } else {
                reject(null);
              }
              // console.log("name : "+item.name+". account :"+item.account+". keystore :"+item.keystore)
              //this.httpRequest2(item.account)
            }, (err) => {
              console.log(err);
              reject(err)
            }
          )
        }
      )
    })
  }
  //创建当前钱包表
  createTableCurrentWallet() {
    this.open()
    let db = single.getDB();
    db.transaction((tx) => {
        tx.executeSql('CREATE TABLE IF NOT EXISTS CURRENTWALLET(' +
          'id INTEGER PRIMARY KEY  AUTOINCREMENT,' +
          'name VARCHAR,' +
          'account VARCHAR,' +
          'mnemonic VARCHAR,' +
          'privatekey VARCHAR,' +
          'keystore VARCHAR)'
          , [], () => {
            this._successCB('createTableCurrentWallet')
          }, (err) => {
            this._errorCB('createTableCurrentWallet', err)
          })
      }, (err) => {
        this._errorCB('transaction', err)
      }, () => {
        this._successCB('transaction')
      }
    )
  }
  //插入当前钱包
  insertCurrentWallet(data) {
    return new Promise((resolve, reject) => {
      this.open()
      let db = single.getDB();
      try {
        this.createTableCurrentWallet();
      } catch (err) {
        console.log(err);
      }
      db.transaction(
        (tx) => {
          let name = data.name
          let account = data.account
          let keystore = data.keystore
          let privatekey = data.privatekey
          let mnemonic = data.mnemonic

          let sql = "INSERT INTO CURRENTWALLET(name,account,keystore, privatekey, mnemonic)" +
            "values(?,?,?,?,?)"
          tx.executeSql(
            sql, [name, account, keystore, privatekey, mnemonic], () => {
              console.log('insertDataCurrentWallet succeed');
              resolve("1");
            }, (err) => {
              console.log(err);
              reject(err.toString());
            }
          )
        }, (error) => {
          this._errorCB('transaction', error)
        }, () => {
          this._successCB('transaction insert data')
        }
      )
    })
  }
  //更新当前钱包
  updateCurrentWallet(data) {
    return new Promise((resolve, reject) => {
      this.open();
      let db = single.getDB();
      db.transaction(
        (tx) => {
          let name = data.name
          let account = data.account
          let keystore = data.keystore
          let privatekey = data.privatekey
          let mnemonic = data.mnemonic
          let sql = `UPDATE CURRENTWALLET SET NAME = '${name}' ,ACCOUNT = '${account}', KEYSTORE = '${keystore}',` +
            `PRIVATEKEY = '${privatekey}', MNEMONIC = '${mnemonic}'`
          tx.executeSql(
            sql, [], () => {
              console.log('UpdateCurrentWallet succeed');
              resolve("1");
            }, (err) => {
              console.log(err);
              reject(err.toString());
            }
          )
        }, (error) => {
          this._errorCB('transaction', error);
          let wallet = {
            name: '',
            account: '',
            keystore: '',
            privatekey: '',
            mnemonic: ''
          }
          this.insertCurrentWallet(wallet).then((msg) => {
            console.log(msg)
          }).catch((err) => {
            console.log(err)
          })
        }, () => {
          this._successCB('transaction insert data')
        }
      )
    });
  }
  //查询current_wallet
  getCurrentWallet() {
    return new Promise((resolve, reject) => {
      this.open();
      let db = single.getDB();
      db.transaction(
        (tx) => {
          let sql = "select * from currentwallet"
          tx.executeSql(
            sql, [], (tx, results) => {
              console.log('getAllWallets succeed')
              let wallets = []
              for (let i = 0; i < results.rows.length; i++) {
                wallets.push(results.rows.item(i))
              }
              //关闭连接
              //this.close();
              resolve(wallets[0]);
              //this.httpRequest2(item.account)
            }, (err) => {
              console.log(err);
              try {
                this.createTableWallets();
              } catch (err) {
                console.log(err)
              }
              reject(err)
            }
          )
        }
      )
    })
  }
  //操作记录 建表
  createTableActionHistory() {
    this.open()
    let db = single.getDB();
    db.transaction((tx) => {
        tx.executeSql('CREATE TABLE IF NOT EXISTS ACTIONHISTORY(' +
          'id INTEGER PRIMARY KEY  AUTOINCREMENT,' +
          'from_account VARCHAR,' +
          'to_account VARCHAR,' +
          'actionname VARCHAR,' +
          'option VARCHAR,' +
          'resulttype VARCHAR,' +
          'resultmsg VARCHAR,' +
          'opttime VARCHAR)'
          , [], () => {
            this._successCB('ActionHistory')
          }, (err) => {
            this._errorCB('ActionHistory', err)
          })
      }, (err) => {
        this._errorCB('transaction', err)
      }, () => {
        this._successCB('transaction')
      }
    )
  }
  //操作记录 插入数据
  insertActionHistory(data) {
    return new Promise((resolve, reject) => {
      this.open();
      let db = single.getDB();
      try {
        this.createTableActionHistory()
      } catch (err) {
        console.log(err)
      }
      db.transaction(
        (tx) => {
          let from_account = data.from_account
          let to_account = data.to_account
          let actionname = data.actionname
          let option = data.option
          let resulttype = data.resulttype
          let resultmsg = data.resultmsg
          let opttime = data.opttime
          let sql = "INSERT INTO ACTIONHISTORY(from_account,to_account,actionname,option,resulttype,resultmsg,opttime)" +
            "values(?,?,?,?,?,?,?)"
          tx.executeSql(
            sql, [from_account,to_account,actionname,option,resulttype,resultmsg,opttime], () => {
              console.log('insertActionHistory succeed');
              resolve("1");
            }, (err) => {
              console.log(err);
              reject(err.toString());
            }
          )
        }, (error) => {
          this._errorCB('transaction', error)
        }, () => {
          this._successCB('transaction insert data')
        }
      )
    })
  }

  //获取所有
  getAllActionHistory() {
    return new Promise((resolve, reject) => {
      this.open();
      let db = single.getDB();
      db.transaction(
        (tx) => {
          let sql = "SELECT * FROM ACTIONHISTORY"
          tx.executeSql(
            sql, [], (tx, results) => {
              console.log('ActionHistory succeed')
              let wallets = []
              for (let i = 0; i < results.rows.length; i++) {
                wallets.push(results.rows.item(i))
              }
              //关闭连接
              //this.close();
              resolve(wallets);
              //this.httpRequest2(item.account)
            }, (err) => {
              console.log(err);
              reject(err)
            }
          )
        }
      )
    })
  }
  //更新 操作记录
  updateActionHistory(data) {
    return new Promise((resolve, reject) => {
      this.open();
      let db = single.getDB();
      db.transaction(
        (tx) => {
          let resulttype = data.resulttype
          let resultmsg = data.resultmsg
          let id = data.id
          let sql = `UPDATE ACTIONHISTORY SET RESULTTYPE = '${resulttype}' ,RESULTMSG = '${resultmsg}' WHERE ID = ${id}`
          tx.executeSql(
            sql, [], () => {
              console.log('UpdateCurrentWallet succeed');
              resolve("1");
            }, (err) => {
              console.log(err);
              reject(err.toString());
            }
          )
        }, (error) => {
          this._errorCB('transaction', error);
          let data = {
            from_account: '',
            to_account: '',
            actionname : '',
            option: '',
            resulttype: '',
            resultmsg : '',
            opttime : ''
          }
          this.insertActionHistory(data).then((msg) => {
            console.log(msg)
          }).catch((err) => {
            console.log(err)
          })
        }, () => {
          this._successCB('transaction insert data')
        }
      )
    });
  }
  //查找sendEth to_account
  getSendEthToAccount(){
    return new Promise((resolve, reject) => {
      this.open();
      let db = single.getDB();
      db.transaction(
        (tx) => {
          let sql = "SELECT TO_ACCOUNT FROM ACTIONHISTORY WHERE ACTIONNAME = 'sendeth' OR  ACTIONNAME = 'sendtoken'"
          tx.executeSql(
            sql, [], (tx, results) => {
              console.log('getSendEthToAccount succeed')
              let wallets = [];
              for (let i = 0; i < results.rows.length; i++) {
                wallets.push(results.rows.item(i))
              }
              let result = [];
              for(let i=0;i<wallets.length;i++){
                for(let j=i+1;j<wallets.length;j++){
                  if(wallets[i].to_account === wallets[j].to_account){
                    j = ++i;
                  }
                }
                result.push(wallets[i]);
              }
              console.log(result)
              //关闭连接
              //this.close();
              resolve(result);
              //this.httpRequest2(item.account)
            }, (err) => {
              console.log(err);
              reject(err)
            }
          )
        }
      )
    })
  }
  //查找交易记录
  getHistoryRecord(){
    return new Promise((resolve, reject) => {
      this.open();
      let db = single.getDB();
      db.transaction(
        (tx) => {
          let sql = "SELECT TO_ACCOUNT,FROM_ACCOUNT,OPTION,OPTTIME,ACTIONNAME " +
            "FROM ACTIONHISTORY WHERE ACTIONNAME = 'sendeth' OR  ACTIONNAME = 'sendtoken' "+
            "ORDER BY OPTTIME DESC"
          tx.executeSql(
            sql, [], (tx, results) => {
              console.log('getSendEthToAccount succeed')
              let records = [];
              for (let i = 0; i < results.rows.length; i++) {
                records.push(results.rows.item(i))
              }
              console.log(records)
              //关闭连接
              //this.close();
              resolve(records);
              //this.httpRequest2(item.account)
            }, (err) => {
              console.log(err);
              reject(err)
            }
          )
        }
      )
    })
  }
  getMyHistoryRecord(account){
    return new Promise((resolve, reject) => {
      this.open();
      let db = single.getDB();
      db.transaction(
        (tx) => {
          let sql = "SELECT TO_ACCOUNT,FROM_ACCOUNT,OPTION,OPTTIME,ACTIONNAME " +
            "FROM ACTIONHISTORY WHERE ACTIONNAME = 'sendeth' OR  ACTIONNAME = 'sendtoken' "+
            "ORDER BY OPTTIME DESC"
          tx.executeSql(
            sql, [], (tx, results) => {
              console.log('getSendEthToAccount succeed')
              let records = [];
              for (let i = 0; i < results.rows.length; i++) {
                if(account == results.rows.item(i).from_account || account == results.rows.item(i).to_account){
                  records.push(results.rows.item(i))
                }
              }
              console.log(records)
              //关闭连接
              //this.close();
              resolve(records);
              //this.httpRequest2(item.account)
            }, (err) => {
              console.log(err);
              reject(err)
            }
          )
        }
      )
    })
  }
}
export default SQLiteUtils;