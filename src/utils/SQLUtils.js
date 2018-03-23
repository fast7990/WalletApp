import SQLiteStorage from 'react-native-sqlite-storage'

SQLiteStorage.DEBUG(true)

class SQLUtiles {
  constructor(database_name = "test.db",
              database_version = "1.0",
              database_displayname = "MySQLite",
              database_size = -1,
              db = null) {
    this.database_name = database_name
    this.database_version = database_version
    this.database_displayname = database_displayname
    this.database_size = database_size
    this.db = db
  }

  open() {
    //开启数据库
    if (this.db) {
      return true;
    }
    console.log('数据库开启')

    this.db = SQLiteStorage.openDatabase(
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
    return;
  }

  close() {
    try {
      if (this.db) {
        this._successCB('close')
        this.db.close()
      } else {
        console.log("SQLiteStorage not open")
      }

      this.db = null
    } catch (err) {

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
    this.db.transaction((tx) => {
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

  createTableCurrentWallet() {
    this.open()
    this.db.transaction((tx) => {
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

  //删表
  dropTableWallets() {
    this.db.transaction((tx) => {
        tx.executeSql('drop table wallets', [], () => {
          console.log('dropTableWallets succeed')
        })
      }, (err) => {
        this._errorCB('transaction', err)
      }, () => {
        this._successCB('transaction')
      }
    )
  }

  dropTableCurrentWallet() {
    this.db.transaction((tx) => {
        tx.executeSql('drop table currentwallet', [], () => {
          console.log('dropTableCurrentWallet succeed')
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
      try {
        this.createTableWallets()
      } catch (err) {
        console.log(err)
      }

      this.db.transaction(
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

  updateCurrentWallet(data) {
    return new Promise((resolve, reject) => {
      this.open();
      try {
        this.createTableCurrentWallet()
      } catch (err) {
        console.log(err)
      }
      this.db.transaction(
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

  insertCurrentWallet(data) {
    return new Promise((resolve, reject) => {
      this.open()
      try {
        this.createTableCurrentWallet()
      } catch (err) {
        console.log(err)
      }
      this.db.transaction(
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

  //查询current_wallet
  getCurrentWallet() {
    return new Promise((resolve, reject) => {
      this.open();
      this.db.transaction(
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

  getAllWallets() {
    return new Promise((resolve, reject) => {
      this.open();
      this.db.transaction(
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
      this.db.transaction(
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
      this.db.transaction(
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

  //操作记录 建表
  createTableActionHistory() {
    this.open()
    this.db.transaction((tx) => {
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
      this.open()
      try {
        this.createTableActionHistory()
      } catch (err) {
        console.log(err)
      }
      this.db.transaction(
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
      this.db.transaction(
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

  //获取所有地址
  getAllActionHistoryToAccount() {
    return new Promise((resolve, reject) => {
      this.open();
      this.db.transaction(
        (tx) => {
          let sql = "SELECT TO_ACCOUNT FROM ACTIONHISTORY"
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
      try {
        this.createTableActionHistory()
      } catch (err) {
        console.log(err)
      }
      this.db.transaction(
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
      this.db.transaction(
        (tx) => {
          let sql = "SELECT TO_ACCOUNT FROM ACTIONHISTORY WHERE ACTIONNAME = 'sendeth'"
          tx.executeSql(
            sql, [], (tx, results) => {
              console.log('getSendEthToAccount succeed')
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
  //查找sendToken to_account
  getSendTokenToAccount(){
    return new Promise((resolve, reject) => {
      this.open();
      this.db.transaction(
        (tx) => {
          let sql = "SELECT TO_ACCOUNT FROM ACTIONHISTORY WHERE ACTIONNAME = 'sendtoken'"
          tx.executeSql(
            sql, [], (tx, results) => {
              console.log('getSendEthToAccount succeed')
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
}

export default SQLUtiles