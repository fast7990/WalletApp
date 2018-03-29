import React, {Component} from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Vibration,
  Dimensions, ToastAndroid, DeviceEventEmitter,TouchableHighlight,
} from 'react-native';
import Camera from 'react-native-camera';
import {connect} from "react-redux";
import {NavigationActions} from 'react-navigation';

@connect((store) => {
  return {}
})
export default class QRTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scanning: true,
      cameraType: Camera.constants.Type.back
    };
  }
  componentDidMount = () => {

  }
  componentWillUnmount = () => {

  }
  _handleBarCodeRead(e) {
    this.setState({scanning: false});
    const { navigation } = this.props;
    Vibration.vibrate();
    //ToastAndroid.show(e.data, ToastAndroid.SHORT);
    navigation.goBack();
    navigation.state.params.onQRCallback({ toAccount: e.data });
    return;
  }
  _onCancel = () => {
    //this.props.dispatch(NavigationActions.back());
    const { navigation } = this.props;
    navigation.goBack();
    navigation.state.params.onQRCallback({ toAccount: "" });
    return;
  }

  render() {
    if(this.state.scanning) {
      return (
        <View style={styles.container}>
          <Text style={styles.welcome}>
            扫描对方二维码
          </Text>
          <View style={styles.rectangleContainer}>
            <Camera
              style={styles.camera}
              type={this.state.cameraType}
              onBarCodeRead={this._handleBarCodeRead.bind(this)}
            >
              <View style={styles.rectangleContainer}>
                <View style={styles.rectangle}/>
              </View>
            </Camera>
          </View>
          <TouchableHighlight onPress={this._onCancel} style={{marginBottom: 20}}>
            <Text style={styles.instructions}>
              取消
            </Text>
          </TouchableHighlight>
        </View>
      );
    }else{
      return (<View  style={styles.container}>
        <Text style={styles.welcome}>
          Barcode Scanner
        </Text>
        <Text style={styles.instructions}>
          Double tap R on your keyboard to reload,{'\n'}
        </Text>
      </View>);
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  camera: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    height: Dimensions.get('window').width,
    width: Dimensions.get('window').width,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    fontSize: 20,
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  rectangleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  rectangle: {
    height: 250,
    width: 250,
    borderWidth: 2,
    borderColor: '#00FF00',
    backgroundColor: 'transparent',
  },
});
