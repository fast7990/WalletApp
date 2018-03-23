import React, { Component } from 'react'
import {StyleSheet, View, Dimensions} from 'react-native'

export default class Line extends Component {

  static defaultProps={
    style: null,
  }

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={[styles.grayLine, this.props.style]}/>
    )
  }
}

const styles = StyleSheet.create({
  grayLine: {
    height: 0.5,
    width: Dimensions.get('window').width,
    backgroundColor: 'gray',
  },
})
