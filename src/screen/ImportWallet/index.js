import React, {Component} from 'react';
import {View} from 'react-native';
import {TabNavigator} from 'react-navigation';
import OfficialWallet from '../OfficialWallet/index';
import Mnemonic from '../Mnemonic/index';
import ImportPrivateKey from '../ImportPrivateKey/index';
import TitleBar from '../../components/TitleBar'

export default class ImportWallet extends Component {
  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#EEE',}}>
        <TitleBar title='导入钱包' type='1'/>
        <TabNav/>
      </View>
    );
  }
}

TabNav = TabNavigator({
  Home: {
    screen: Mnemonic,
    navigationOptions: {
      tabBarLabel: '助记词',
    },
  },
  Type: {
    screen: OfficialWallet,
    navigationOptions: {
      tabBarLabel: '官方钱包',
    }
  },
  ShopCar: {
    screen: ImportPrivateKey,
    navigationOptions: {
      tabBarLabel: '私钥',
    }
  },
}, {
  //设置TabNavigator的位置
  tabBarPosition: 'top',
  //是否在更改标签时显示动画
  animationEnabled: true,
  //是否允许在标签之间进行滑动
  swipeEnabled: true,
  //按 back 键是否跳转到第一个Tab(首页)， none 为不跳转
  backBehavior: "none",
  //设置Tab标签的属性

  tabBarOptions: {
    //Android属性
    upperCaseLabel: false,//是否使标签大写，默认为true
    //共有属性
    showIcon: true,//是否显示图标，默认关闭
    showLabel: true,//是否显示label，默认开启
    activeTintColor: '#6699ff',//label和icon的前景色 活跃状态下（选中）
    inactiveTintColor: 'gray',//label和icon的前景色 活跃状态下（未选中）
    style: { //TabNavigator 的背景颜色
      backgroundColor: 'white',
      height: 55,
    },
    indicatorStyle: {//标签指示器的样式对象（选项卡底部的行）。安卓底部会多出一条线，可以将height设置为0来暂时解决这个问题
      height: 3,
      backgroundColor: '#6699ff',
    },
    labelStyle: {//文字的样式
      fontSize: 18,
      marginTop: -15,
    },
  },
});