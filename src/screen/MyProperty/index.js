import React, {Component} from "react";
import {StyleSheet, Text, View, TextInput, Dimensions, Alert,TouchableOpacity,
  TouchableHighlight,FlatList} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import TitleBar from '../../components/TitleBar';
import SQLUtils from '../../utils/SQLUtils';
let sqlite = new SQLUtils();
export default class MyProperty extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data:[{key: '0',name: "基本信息"}, {key: '1',name: "固定资产"},{key: '2',name: "收入信息"},{key: '3',name: "工作信息"},{key: '4',name: "教育信息"}],
      account:'',
      name:'',
    };
  }
  componentDidMount = () => {
    sqlite.getCurrentWallet().then((data) => {
      this.setState({account: data.account,name: data.name});
      console.log(data);
    })
  }
  _onQueryPressed = (name) => {
    this.props.navigation.navigate('InfoDetail',{ type: name, account: this.state.account });
  }
  _renderItem = ({item}) => (
    <View style={styles.listItem}>
      <Text style={styles.itemText}>{item.name}</Text>
      <TouchableHighlight onPress={() => this._onQueryPressed(item.name)}>
        <View style={styles.rightContainer}>
          <Icon name="angle-right" size={30}/>
          {/* <Image style={styles.rightImage} source={require('./images/right.jpg')}></Image> */}
        </View>
      </TouchableHighlight>
    </View>
  );
  render(){
    let data = Object.assign([],this.state.data)
    return(
      <View style={styles.container}>
        <TitleBar title='我的资产' type='0'/>
        <View style={styles.nameContainer}>
          <Text style={{fontSize:20}}>帐户名 : {this.state.name}</Text>
        </View>
        <FlatList
          data={data}
          renderItem={this._renderItem}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#EEE',
  },
  flatlist: {

  },
  nameContainer:{
    padding:10,
    borderBottomWidth:0.5,
    backgroundColor: '#FFFFFF',
  },
  listItem: {
    padding: 10,
    height: 50,
    justifyContent : 'space-between',
    alignItems : 'center',
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  itemText: {
    fontSize: 20,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
    justifyContent:'flex-end',
  },
});