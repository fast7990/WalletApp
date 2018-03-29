import React, {Component} from "react";
import {StyleSheet, Text, View, TextInput, Dimensions, Alert,TouchableOpacity,
  TouchableHighlight,FlatList} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import TitleBar from '../../components/TitleBar';
import Line from '../../components/Line';
export default class InfoDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data:[],
    };
  }
  componentDidMount = () => {
    this.getData("abc","1");
  }
  getData = () => {
    let account = this.props.navigation.state.params.account;
    let type = this.props.navigation.state.params.type;
    let data1 = [{key:"姓名",value:"大川"},{key:"手机号",value:"13355667788"},{key:"身份证号",value:""}];
    let data2 = [{key:"大学",value:"吉林大学"},{key:"硕士",value:"武汉大学"}];
    if(type == "基本信息"){
      this.setState({data:data1});
    }else if(type == "教育信息"){
      this.setState({data:data2});
    }
    console.log(this.state.data);
  }
  _renderItem = ({item}) => (
    <View>
      <View style={styles.itemContainer}>
        <Text style={styles.titleText}>{item.key}</Text>
        <Text style={styles.contentText}>{item.value}</Text>
      </View>
      <Line/>
    </View>
  );
  render(){
    return(
      <View style={styles.container}>
        <TitleBar title='详细信息' type='1' name='MyProperty'/>
        <FlatList
          data={this.state.data}
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
  accountContainer: {
    paddingLeft: 10,
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountText: {
    height: 50,
    textAlignVertical: 'center',
    fontSize: 16,
    color: '#71716d',
  },
  accountInput: {
    flex: 1,
    height: 50,
    marginLeft: 20,
    fontSize: 16,
    textAlignVertical: 'center',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  itemContainer: {
    flexDirection: 'row',
    paddingLeft: 10,
    backgroundColor: '#FFFFFF',
  },
  markContentText: {
    flex: 1,
    height: 110,
    marginTop: 15,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  titleText: {
    height: 50,
    width: 100,
    textAlignVertical: 'center',
    fontSize: 16,
    color: '#71716d',
  },
  contentText: {
    flex: 1,
    width: 100,
    textAlignVertical: 'center',
    fontSize: 16,
    color: '#71716d',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  passwordContainer: {
    height: 160,
    width: Dimensions.get('window').width,
    justifyContent: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 55,
  },
  close: {
    width: 55,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendText: {
    height: 50,
    width: 70,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: '#6699ff',
    color: 'white',
    fontSize: 15,
  },
  confirmContainer: {
    height: 300,
    width: Dimensions.get('window').width,
    justifyContent: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  itemContainer: {
    flexDirection: 'row',
    paddingLeft: 10,
    backgroundColor: '#FFFFFF',
  },
  text: {
    height: 50,
    textAlignVertical: 'center',
    fontSize: 17,
    color: '#575757',
    marginHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    textAlignVertical: 'center',
  },
});