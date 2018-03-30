import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {addNavigationHelpers, StackNavigator, NavigationActions} from 'react-navigation'
import {addListener} from '../utils/redux'
import {BackHandler} from "react-native"

import HomeScreen from '../screen/Home/index'
import ImportWallet from '../screen/ImportWallet/index'
import CreateWallet from '../screen/CreateWallet/index'
import ManageWallet from '../screen/ManageWallet/index'
import BackupKey from '../screen/BackupKey/index'
import Records from '../screen/Records/index'
import ImportInformation from '../screen/ImportInformation/index'
import SearchInformation from '../screen/SearchInformation/index'
import PrivateKey from '../screen/PrivateKey/index'
import ModalTest from '../screen/ModalTest/index'
import SendEth from '../screen/SendEth/index'
import SendToken from '../screen/SendToken/index'
import SQLTest from '../screen/SQLTest/index'
import SQLTest2 from '../screen/SQLTest2/index'
import APITest from '../screen/APITest/index'
import Scanner from '../screen/Scanner/index'
import Mnemonic from '../screen/Mnemonic/index'
import QRTest from '../screen/QRTest/index'
import QRCode from '../screen/QRCode/index'
import AccountInformation from '../screen/AccountInformation/index';
import MyProperty from '../screen/MyProperty/index'
import InfoDetail from '../screen/InfoDetail/index'
import ChangePassword from '../screen/ChangePassword/index';
import ExportKeystore from '../screen/ExportKeystore/index';
import MyRecords from '../screen/MyRecords/index';
import ReduxTest from '../screen/ReduxTest/index';

export const AppNavigator = StackNavigator({
    Home: {
      screen: HomeScreen,
    },
    ImportWallet: {
      screen: ImportWallet
    },
    CreateWallet: {
      screen: CreateWallet
    },
    ManageWallet: {
      screen: ManageWallet
    },
    BackupKey: {
      screen: BackupKey
    },
    Records: {
      screen: Records
    },
    ImportInformation: {
      screen: ImportInformation
    },
    SearchInformation: {
      screen: SearchInformation
    },
    PrivateKey: {
      screen: PrivateKey
    },
    ModalTest: {
      screen: ModalTest
    },
    SendEth: {
      screen: SendEth
    },
    SendToken: {
      screen: SendToken
    },
    SQLTest: {
      screen: SQLTest
    },
    SQLTest2: {
      screen: SQLTest2
    },
    APITest: {
      screen: APITest
    },
    Scanner: {
      screen: Scanner
    },
    Mnemonic: {
      screen: Mnemonic
    },
    QRTest: {
      screen: QRTest
    },
    QRCode : {
      screen : QRCode
    },
    AccountInformation : {
      screen : AccountInformation
    },
    MyProperty : {
      screen : MyProperty
    },
    InfoDetail : {
      screen : InfoDetail
    },
    ChangePassword : {
      screen : ChangePassword
    },
    ExportKeystore : {
      screen : ExportKeystore
    },
    MyRecords : {
      screen : MyRecords
    },
    ReduxTest : {
      screen : ReduxTest
    },
  },
  {
    initialRouteName: 'Home',
    headerMode: 'none'
  })

class AppWithNavigationState extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    nav: PropTypes.object.isRequired
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.onBackPress)
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress)
  }

  onBackPress = () => {
    const {dispatch, nav} = this.props;
    if (nav.index === 0) {
      return false;
    }
    dispatch(NavigationActions.back())
    return true
  }

  render() {
    const {dispatch, nav} = this.props;
    return (
      <AppNavigator
        navigation={addNavigationHelpers({
          dispatch,
          state: nav,
          addListener,
        })}
      />
    );
  }
}

const mapStateToProps = state => ({
  nav: state.nav,
})

export default connect(mapStateToProps)(AppWithNavigationState)