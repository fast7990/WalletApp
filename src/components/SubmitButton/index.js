import React, { Component } from 'react';
import {StyleSheet, Text, View, TouchableNativeFeedback} from 'react-native';

export default class SubmitButton extends Component {
  static defaultProps={  
    buttonText:'',
    enable: false,
    onPressButton: null,
	  style:null
  };  

    constructor(props) {
      super(props);
    }

    render() {
      return (
        <TouchableNativeFeedback disabled={!this.props.enable} onPress={this.props.onPressButton}>
          <View style={[styles.container, this.props.style, this.props.enable ? styles.enableBackground : styles.disabledBackgournd]}>
            <Text style={styles.buttonText}>{this.props.buttonText}</Text>
          </View>
        </TouchableNativeFeedback>
      );
    }
  }
  
  const styles = StyleSheet.create({
    container:{
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      margin: 40,
      height: 40,
      backgroundColor: '#c8c9cb',
    },
    buttonText:{
      color: '#FFFFFF',
      fontSize: 20,
    },
    enableBackground:{
      backgroundColor: '#6699ff',
    },
    disabledBackgournd: {
      backgroundColor: '#c8c9cb',
    },
  });
  