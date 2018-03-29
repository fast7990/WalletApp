import React, {Component} from 'react';
import {StyleSheet, Text, View, TextInput, Alert, ToastAndroid, DeviceEventEmitter } from 'react-native';
import TitleBar from '../../components/TitleBar'
import SubmitButton from '../../components/SubmitButton'

export default class ExportKeystore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keystore: '',
    }
  }

  onPressCopyStore() {}

  render() {
    return (
      <View style={styles.container}>
        <TitleBar title='导出Keystore' type='0'/>
        <SubmitButton enable buttonText={'复制keyStore'} onPressButton={this.onPressCopyStore.bind(this)}/>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEE',
  },
});