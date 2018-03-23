import React from 'react'
import {StyleSheet, Button, View, Text} from 'react-native';

export default class Scanner extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {

      return (
        <View style={styles.container}>
          <Text>Scanner</Text>
        </View>
      )
    }
}

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
  });
