import React, { Component } from 'react';
import {StyleSheet, Text, View, TextInput, ListView, Image} from 'react-native';
import TitleBar from '../../components/TitleBar';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

  export default class Records extends Component {

    constructor(props) {
      let ds = new ListView.DataSource({rowHasChanged:(r1, r2) => r1 != r2});
      //{"title" : "记录1", "num": 1},
      let newData = [];
      super(props);
      this.state = { 
        dataSource: newData ? null : ds.cloneWithRows(newData),
        account: 'abc',
      };
    }

    renderRow(rowData){
      return(
      <View style={styles.rowContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{rowData.title}</Text>
          <FontAwesome name="angle-right" size={30}/>
        </View>
        <View style={styles.grayLine}></View>
      </View>
      );
    }

    render() {
      return (
        <View style={styles.container}>
          <TitleBar title='收发记录' type='1' name='Home'/>
          <Text style={styles.accountText}>当前账户：{this.state.account}</Text>
          {this.state.dataSource != null ? 
            <ListView
              style={styles.listview}
              dataSource={this.state.dataSource}
              renderRow={this.renderRow}
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
  });
  