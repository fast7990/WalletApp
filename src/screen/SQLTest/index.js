import React, { Component } from 'react';  
import {  
	AppRegistry,
	Text,
	TextInput,
	View,
	StyleSheet,
    TouchableHighlight
} from 'react-native'
import SQLite from '../../utils/sqlite'

const sqLite = new SQLite()

export default class SQLTest extends Component{  
	// 构造
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            text:'',
            db : null
        }
    }

	_onPressButton = () => {
		console.log(this.state.text)
	}
	_onAddButton = () => {

        //建表
        sqLite.createTable()

        //模拟一条数据
        let userData = []
        let user = {}
        user.name = this.state.text
        userData.push(user)
        //插入数据
        sqLite.insertUserData(userData)
    }
    _onFindButon = () => {
        //查询
        console.log('被点到')
        this.state.db.transaction(
            (tx)=>{
                tx.executeSql("select * from user", [],(tx,results)=>
                    {
                        var len = results.rows.length
                        for(let i=0; i<len; i++){
                            var u = results.rows.item(i)
                            //一般在数据查出来之后，  可能要 setState操作，重新渲染页面
                            console.log("姓名："+u.name+"，id："+u.id)
                        }
                    }
                )
            },(error)=>{//打印异常信息
                console.log(error)
            }
        )
    }

    componentWillUnmount = () => {
        console.log('数据库将关闭，数据将被删除')
        //删除数据
        sqLite.deleteData()
        //关闭连接
		sqLite.close()
	}  
	componentDidMount = () => {
        //开启数据库
        if(!this.state.db){
            this.state.db = sqLite.open()
        }
        console.log('数据库开启')
	}  
    render() {
        return (
            <View>

                <TextInput
                    style={{height: 40}}
                    onChangeText={(text) => this.setState({text})}
                    value={this.state.text}
                />
                <TouchableHighlight
                    onPress={this._onAddButton}
                    style={{marginTop:15}}
                >
                    <Text>提交</Text>
                </TouchableHighlight>
                <TouchableHighlight
                    onPress={this._onFindButon}
                    style={{marginTop:15}}
                >
                    <Text>查询</Text>
                </TouchableHighlight>


            </View>
        )
    }
}  