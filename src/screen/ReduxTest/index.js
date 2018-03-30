import React,{Component}  from "react";
import {StyleSheet, Text, View, TextInput, Image, TouchableOpacity, Alert, TouchableHighlight} from 'react-native';
import Singleton from '../../utils/Singleton';
let single = new Singleton();
import SQLiteUtils from '../../utils/SQLiteUtils';
let sqlite = new SQLiteUtils();
export default class ReduxTest extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }
  componentDidMount() {
    //this.setState({db:this.props.state.sqlite.db})
  }
  _onClick = () => {
    sqlite.open();
    console.log(single.getDB());
  }
  _onSearch = () => {
    sqlite.close();
    console.log(single.getDB());
  }
  _onOpen = () => {
    console.log(single.getDB());
  }
  _onClose = () => {

  }
  render(){
    return(
      <View>
        <Text style={styles.text}>db:{this.props.db}</Text>
        <TouchableHighlight onPress={this._onClick}>
          <Text  style={styles.text}>更改</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={this._onSearch}>
          <Text  style={styles.text}>查找</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={this._onOpen}>
          <Text  style={styles.text}>open</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={this._onClose}>
          <Text  style={styles.text}>close</Text>
        </TouchableHighlight>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  text : {
    fontSize : 20,
    margin : 5,
  },
})