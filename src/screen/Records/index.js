import React, {Component} from 'react';
import {StyleSheet, Text, View, TextInput, ListView, Image, SectionList} from 'react-native';
import TitleBar from '../../components/TitleBar';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import SQLUtils from '../../utils/SQLUtils';
let sqlite = new SQLUtils();
import web3API from '../../utils/web3API';
let web3 = new web3API();

export default class Records extends Component {
  constructor(props) {
    let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 != r2});
    //{"title" : "记录1", "num": 1},
    let newData = [];
    super(props);
    this.state = {
      dataSource: newData ? null : ds.cloneWithRows(newData),
      account: 'abc',
      shortAccount:'',
      records:null,
    };
  }

  componentDidMount = () => {
    sqlite.getCurrentWallet().then((data) => {
      let str = web3.getShortAccount(data.account);
      console.log(str);
      this.setState({shortAccount: str});
      console.log(this.state.shortAccount)
    }).catch((err) => {
      console.log(err)
    })
    sqlite.getHistoryRecord().then((data) => {
      console.log(data);
      let records = [];
      for(let i=0;i<data.length;i++){
        let option = JSON.parse(data[i].option)
        let record = {
          actionname : data[i].actionname,
          from_account: data[i].from_account,
          to_account: data[i].to_account,
          amount: option.amount,
          opttime: data[i].opttime,
        }
        records.push(record)
      }
      this.setState({records})
      console.log(this.state.records)
    }).catch((err)=>{
      console.log(err)
    })
  }
  componentWillUnmount = () => {
    sqlite.close()
  }

  /*{this.state.records != [] ?
  <ListView
  style={styles.listview}
  dataSource={this.state.records}
    //renderRow={this.renderRow}
  />
  :
  <View style={styles.noDataContainer}>
  <FontAwesome name="edit" size={25}/>
  <Text style={styles.noDataText}>无更多记录</Text>
  </View>
  }*/
  render() {
    let H = [{"actionname": "操作类型","from_account":"发送账户","to_account":"接收账户","amount":"数量","opttime":"时间"}]
    return (
      <View style={styles.container}>
        <TitleBar title='收发记录' type='1' name='Home'/>
        <Text style={styles.accountText}>当前账户：{this.state.shortAccount}</Text>
        {this.state.records != null ?
          <SectionList
            style={styles.slist}
            sections={[
              { data: H, renderItem: this.renderItemHeader },
              { data: this.state.records, renderItem: this.renderItemList },
            ]}
            renderSectionHeader={({section}) =>
              <View style={{borderRadius: 4,
                borderWidth: 0.5,
                borderColor: '#d6d7da',}}>
              </View>
            }
            keyExtractor={(item, index) => index}
          />
          :
          <View style={styles.noDataContainer}>
            <FontAwesome name="edit" size={25}/>
            <Text style={styles.noDataText}>无更多记录</Text>
          </View>
        }
      </View>
    );
  }
  renderItemHeader = ({item}) => (
    <View style={styles.slist_item}>
      <Text style={styles.slist_item_text}>{item.actionname}</Text>
      <Text style={styles.slist_item_text}>{item.from_account}</Text>
      <Text style={styles.slist_item_text}>{item.to_account}</Text>
      <Text style={styles.slist_item_text}>{item.amount}</Text>
      <Text style={styles.slist_item_text}>{item.opttime}</Text>
    </View>
  )
  renderItemList = ({item}) => (
    <View style={styles.slist_item} >
      <Text style={styles.slist_item_text}>{web3.changeName(item.actionname)}</Text>
      <Text style={styles.slist_item_text}>{web3.getShortAccount(item.from_account)}</Text>
      <Text style={styles.slist_item_text}>{web3.getShortAccount(item.to_account)}</Text>
      <Text style={styles.slist_item_text}>{item.amount}</Text>
      <Text style={styles.slist_item_text}>{moment(parseInt(item.opttime)).format("YYYY-MM-DD HH:mm:ss")}</Text>
    </View>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEE',
  },
  accountText: {
    height: 40,
    color: '#7EC0EE',
    fontSize: 16,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: '#BFEFFF',
  },
  listview: {
    flex: 1,
  },
  noDataContainer: {
    height: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 17,
    marginLeft: 5,
  },
  rowContainer: {
    flex: 1,
    height: 60.5,
    backgroundColor: '#FFFFFF',
  },
  titleContainer: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  titleText: {
    fontSize: 16,
    color: '#71716d',
  },
  rightImage: {
    height: 20,
    width: 20,
    marginLeft: 5,
  },
  grayLine: {
    height: 0.5,
    flexGrow: 1,
    flexShrink: 1,
    backgroundColor: 'gray',
  },
  slist : {
    flex : 1,
    backgroundColor : 'white'
  },
  slist_item : {
    height : 60,
    alignItems : 'center',
    flexDirection: 'row'
  },
  slist_item_text : {
    flex : 1,
    marginHorizontal: 4,
    fontSize: 14,
    textAlign: 'center',
  }
});
