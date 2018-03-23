import React, { Component } from 'react'
import {StyleSheet, Text} from 'react-native'

export default class ErrorText extends Component {

  static defaultProps={
    text:'',
  }

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Text style={styles.errorText}>
        {this.props.text}
      </Text>
    )
  }
}

const styles = StyleSheet.create({
  errorText: {
    color: 'red',
    padding: 10,
  },
})
