import React, { Component } from 'react';
import {StyleSheet, Text, View, TextInput, ListView, Image, TouchableHighlight} from 'react-native';
import TitleBar from '../../components/TitleBar';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class ManageWallet extends Component {
  constructor(props) {
    var ds = new ListView.DataSource({rowHasChanged:(r1, r2) => r1 != r2});
    var newData = [{"title" : "icon", "img" :'',"num": 1},];
    super(props);
    this.state = {
      dataSource: ds.cloneWithRows(newData),
    };
  }

  onBackupPressed(){
    this.props.navigation.navigate('BackupKey')
  }

  renderOpretion(imageSource, text){
    return(
      <View style={styles.operationContainer}>
        <Icon name={imageSource} size={30}/>
        {/* <Image style={styles.operationIcon}  source={imageSouce}></Image> */}
        <Text style={styles.operationText}>{text}</Text>
      </View>
    );
  }

  renderRow(rowData){
      return(
        <View style={styles.rowContainer}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <Image style={styles.iconImage} source={rowData.img}/>
              <Text style={styles.titleText}>{rowData.title}</Text>
            </View>
            <TouchableHighlight onPress={this.onBackupPressed}>
              <View style={styles.rightContainer}>
                <Text style={styles.baseText}>请备份</Text>
                <Icon name="angle-right" size={30}/>
                {/* <Image style={styles.rightImage} source={require('./images/right.jpg')}></Image> */}
              </View>
            </TouchableHighlight>
          </View>
          <View style={styles.grayLine}></View>
          <View style={styles.bottomItemContainer}>
            <Text style={styles.numText}>{rowData.num}</Text>
            <Text style={styles.gxsText}>GXS</Text>
          </View>
        </View>
      );
  }

  render() {
      return (
        <View style={styles.container}>
          <TitleBar title='钱包管理' type='1' name='Home'/>
          <ListView
            style={styles.listView}
            dataSource={this.state.dataSource}
            renderRow={this.renderRow.bind(this)}
          />
          <View style={styles.bottomContainer}>
            {this.renderOpretion("arrow-down" ,'导入钱包')}
            {this.renderOpretion("plus" ,'创建钱包')}
            {/* {this.renderOpretion(require("'./images/right.jpg'") ,'创建钱包')} */}
          </View>
        </View>
      );
  }
}

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#EEE',
    },
    listView: {
      flex: 1,
    },
    rowContainer: {
      height: 100,
      paddingHorizontal: 10,
      backgroundColor: '#FFFFFF',
    },
    titleContainer: {
      height: 60,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    iconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconImage: {
      height: 40,
      width: 40,
    },
    titleText: {
      marginLeft: 10,
      fontSize: 16,
      color: '#71716d',
    },
    rightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    baseText: {
      fontSize: 18,
      fontWeight: 'bold',
      marginRight: 5,
      color: '#ed3f14',
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
      marginLeft: 50,
      backgroundColor: 'gray',
    },
    bottomItemContainer:{
      flex: 39.5,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    numText: {
      fontSize: 20,
      color: '#6699ff',
    },
    gxsText: {
      fontSize: 16,
      marginLeft: 2,
    },
    bottomContainer: {
      height: 60,
      flexDirection: 'row',
      backgroundColor: '#FFFFFF',
    },
    operationContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 0.5,
    },
    operationIcon: {
      width: 30,
      height: 30,
    },
    operationText: {
      marginLeft: 10,
      fontSize: 22,
      color: '#3d3d3b',
    },
  });
  