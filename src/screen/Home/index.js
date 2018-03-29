import React from 'react'
import {
  Button, View, Text, PixelRatio, StyleSheet, TouchableHighlight, Image, ViewPagerAndroid,
  Dimensions, Alert, DeviceEventEmitter
} from 'react-native'
import Drawer from 'react-native-drawer'
import Menu from '../../components/Menu'
import Line from '../../components/Line'
import {connect} from 'react-redux'
import {link} from '../../actions/navActions'
import SQLUtils from '../../utils/SQLUtils'
let sqlite = new SQLUtils()
import web3API from '../../utils/web3API'
let web3 = new web3API()
@connect((store) => {
    return {}
})
export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      wallets: null,
      dataSource: null,
      index:0
    };
  }
  componentDidMount = () => {
    this.getData();
    this.importwalletEmitter = DeviceEventEmitter.addListener('WALLET', (result) => {
      if(result == 'success' || result == 'render') {
        this.getData();
      }
      this.closeControlPanel();
    });
  }

  componentWillUnmount = () => {
    this.importwalletEmitter.remove();
    sqlite.close()
  }
  _onQRCodePressed = () => {
    this.props.dispatch(link("QRCode"))
  }
  getData(){
    //得到所有钱包
    sqlite.getAllWallets().then((wallets) => {
      if (wallets != null) {
        console.log(wallets)
        this.setState({wallets: wallets})
        //取得当前账户，如果返回空，设置当前账户
        sqlite.getCurrentWallet().then((data)=>{
          if(data == null){
            sqlite.insertCurrentWallet(this.state.wallets[0]).then((msg)=>{
              console.log(msg)
            }).catch((err)=>{
              console.log(err)
            })
          }
        }).catch((err)=>{
          sqlite.insertCurrentWallet(this.state.wallets[0]).then((msg)=>{
            console.log(msg)
          }).catch((err)=>{
            console.log(err)
          })
        })
        web3.getBalances(wallets[0].account).then((msg) => {
          if(msg.data.code){
            this.setState({dataSource: msg.data});
          }
        }).catch((err)=>{  })
      }
    }).catch((err)=>{})
  }

  pushToAccount() {
    this.props.navigation.navigate('AccountInformation',
      {
        name: this.state.wallets && this.state.wallets[this.state.page].name,
        account: this.state.dataSource && this.state.dataSource.data.account,
        eth: this.state.dataSource && this.state.dataSource.data.eth
      }
    );
  }

  closeControlPanel = () => {
    this._drawer.close()
  }

  openControlPanel = () => {
    this._drawer.open()
  }

  onPageSelected = (e) =>
  {
    this.setState({page: e.nativeEvent.position})
    sqlite.getWalletByIndex(e.nativeEvent.position).then((wallet) => {
      if (wallet != null) {
        sqlite.updateCurrentWallet(wallet).then((msg) => {
            console.log( msg)
        }).catch((err)=>{  })
        web3.getBalances(wallet.account).then((msg) => {
          if(msg.data.code){
            this.setState({dataSource: msg.data});
          }
        }).catch((err)=>{  })
      }
    }).catch((err)=>{});
  }

  renderIndicator = () => {
    let indicators = [];
    let length = 0;
    if(this.state.wallets == null){
      length = 0
    }else{
      length = this.state.wallets.length
    }
    for (let i = 0; i < length; i++) {
      indicators.push(<View key={10 + i}
      style={[styles.indicator, this.state.page == i && styles.enableIndicator]}/>);
    }

    return (<View style={styles.indicatorContainer}>{indicators}</View>);
  }

  renderPage = () => {
    let pages = [];
    let length = 10;
    if(this.state.wallets == null){
      length = 10
    }else {
      length = this.state.wallets.length;
    }

    for (let i = 0; i < length; i++) {
      pages.push(
        <View key={i} style={styles.header_down}>
          <Image
            style={styles.header_down_icon}
            source={require('./img/logo.png')}
          />
          <View style={styles.header_down_info}>
            {this.state.wallets &&
            <Text style={styles.header_down_info_label}>
                {this.state.wallets[i].name}
            </Text>
            }
            <TouchableHighlight onPress={this._onQRCodePressed}>
            <Image
              style={styles.header_down_info_icon}
              source={require('./img/icon4.png')}
            />
            </TouchableHighlight>
          </View>
          <View style={styles.header_down_label}>
            <Text style={styles.header_down_label_style}>
              备份私钥
            </Text>
          </View>
        </View>
      );
    }

    return pages;
  }

  renderItem = (account, value) => {
    let str = web3.getShortAccount(account);
    return(
      <View style={styles.itemContainer}>
        <Text>{str}</Text>
        <Text>{value}</Text>
      </View>
    );
  }

  render()
  {
    return (
      <Drawer
        type="static"
        content={<Menu pushToAccount={this.pushToAccount.bind(this)}/>}
        tapToClose={true}
        ref={(ref) => this._drawer = ref}
        openDrawerOffset={(viewport) => {
          if (viewport.width < 240) {
            return viewport.width * 0.1
          }
          return viewport.width - 240
        }}
      >
        <View style={styles.container}>
          <View style={[styles.header]}>
            <View style={styles.header_up}>
              <TouchableHighlight onPress={this.openControlPanel}>
                <Image
                    style={styles.header_up_icon}
                    source={require('./img/icon5.png')}
                />
              </TouchableHighlight>
            </View>
            <ViewPagerAndroid
              style={styles.viewPager}
              initialPage={0}
              onPageSelected={this.onPageSelected.bind(this)}
            >
              {this.renderPage()}
            </ViewPagerAndroid>
            {this.renderIndicator()}
          </View>
          <View style={[styles.content]}>
            <TouchableHighlight style={styles.content_item} onPress={() => {
                this.props.dispatch(link('SendEth'))
            }}>
              <View>
                <View style={styles.content_item_icon_wrapper}>
                  <Image
                    style={styles.content_item_icon1}
                    source={require('./img/icon1.png')}
                  />
                </View>
                <Text sytle={styles.font}>发送ETH</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight style={styles.content_item} onPress={() => {this.props.dispatch(link('SendToken'))}}>
              <View>
                <View style={styles.content_item_icon_wrapper}>
                  <Image
                    style={styles.content_item_icon2}
                    source={require('./img/icon2.png')}
                  />
                </View>
                <Text sytle={[styles.font]}>发送Token</Text>
              </View>
            </TouchableHighlight>
            <View style={styles.content_item}>
              <View style={styles.content_item_icon_wrapper}>
                <Image
                  style={styles.content_item_icon3}
                  source={require('./img/icon3.png')}
                />
              </View>
              <Text style={[styles.font]}>接收</Text>
            </View>
          </View>
          <View style={styles.footer}>
            {this.state.dataSource &&
            <View style={styles.footer}>
              {this.renderItem(this.state.dataSource.data.account, this.state.dataSource.data.eth + '(eth)')}
              <Line/>
              {this.renderItem(this.state.dataSource.data.account, this.state.dataSource.data.token +'(token)')}
            </View>
            }
          </View>
        </View>
      </Drawer>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column'
  },
  item: {
    flexDirection: 'column',
    height: 80
  },
  header: {
    flexDirection: 'column',
    height: 262,
    backgroundColor: '#1A6FBD'
  },
  header_up: {
    height: 36,
    width: 360
  },
  header_up_icon: {
    height: 21,
    width: 21,
    marginLeft: 15,
    marginTop: 15
  },
  header_down: {
    height: 241,
    width: 360,
    alignItems: 'center',
    flexDirection: 'column'
  },
  header_down_icon: {
    marginTop: 30,
    height: 77,
    width: 62
  },
  header_down_info: {
    height: 15,
    marginTop: 14,
    marginBottom: 14,
    flexDirection: 'row'
  },
  header_down_info_label: {
    marginRight: 5
  },
  header_down_info_icon: {
    height: 15,
    width: 14
  },
  header_down_label: {
    height: 14,
    width: 59
  },
  header_down_label_style: {},
  content: {
    flexDirection: 'row',
    height: 122,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    shadowColor: '#2e65c4',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.09
  },
  content_item: {
    flex: 1,
    height: 63,
    alignItems: 'center',
    justifyContent: 'center'
  },
  content_item_icon_wrapper: {
    height: 37,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5
  },
  content_item_icon1: {
    height: 37,
    width: 23
  },
  content_item_icon2: {
    height: 28,
    width: 28
  },
  content_item_icon3: {
    height: 26,
    width: 28
  },
  footer: {
    height: 300,
    backgroundColor: '#fdfbfb'
  },
  font: {
    fontSize: 15
  },
  fontBig: {
    fontSize: 30,
    color: 'blue'
  },
  viewPager: {
    flex: 1,
  },
  indicatorContainer: {
    height: 10,
    width: Dimensions.get('window').width,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 230,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    height: 10,
    width: 10,
    borderRadius: 5,
    marginHorizontal: 2,
    backgroundColor: 'gray',
  },
  enableIndicator: {
    backgroundColor: 'orange',
  },
  itemContainer:{
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    width: Dimensions.get('window').width,
  },
})