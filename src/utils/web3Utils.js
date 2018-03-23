/**
 * Created by 欧阳先学 on 2018/2/25 0025.
 */
function web3Utils() {
}
web3Utils.prototype.web3 = new Web3();
web3Utils.prototype.global_keystore;
web3Utils.prototype.tokenContract;
web3Utils.prototype.nodejs_server = "http://192.168.0.133:8888";//47.104.7.39
web3Utils.prototype.chain_server = "http://47.104.7.39:8545";
// "http://192.168.0.133:8545", 47.104.7.39   192.168.0.101   "http://192.168.0.101:8545" 9081

web3Utils.prototype.keystore = "";
web3Utils.prototype.nKeystore;
web3Utils.prototype.AccountName;
web3Utils.prototype.getAccountName = function () {
    // if(AccountName !=null &&AccountName !=""){
    return AccountName;
}
web3Utils.prototype.getAllWallets = function () {
    var v = localStorage.getItem('allwallets');
    var allwallets = null;
    if (v != "" && v != null) {
        var allwallets = JSON.parse(v);
        return allwallets;
    } else {
        return [{"name": "", "account": "", "keystore": ""}]
    }
}
web3Utils.prototype.putInfo = function (option, callback) {
    var currentWallet = web3Utils.getCurrentWallet();
    option.account = currentWallet;
    option.account_hash= currentWallet;
    var url = web3Utils.nodejs_server + "/action.do?actname=putinfo&account_hash=" + currentWallet + "&user_name=" + encodeURIComponent(option.user_name);
    $.ajax({
        type: 'POST',
        url: url,
        data: option,
        dataType: "html",
        success: function (vMsg) {
            var msg;
            console.log(vMsg);
            if (vMsg.length > 1) {
                msg = JSON.parse(vMsg);
                callback(1, msg.msg);
                alert("提交成功 " + msg.msg);
            } else {
                alert("发生意外错误！");
                callback(0, msg.msg);
            }
        }
    });
    return true;
}
web3Utils.prototype.queryInfo = function (user_card, user_mobile,password,callback) {
    var currentWallet = web3Utils.getCurrentWallet();
    var wallet = web3Utils.getWalletbyAccount(currentWallet);
    var url = web3Utils.nodejs_server + "/action.do?actname=queryinfo&account_hash=" + currentWallet;//application/json
    var option = {
        "keystore": JSON.stringify(wallet.keystore),
        "account_hash": currentWallet,
        "user_card": user_card,
        "password": password,
        "user_mobile": user_mobile
    };
    $.ajax({
        type: 'POST',
        url: url,
        data: option,
        dataType: "html",
        success: function (vMsg) {//debugger;
            var msg;
            if (vMsg.length > 1) {
                msg = JSON.parse(vMsg);
                if(msg.code==1){
                    callback(msg.code, msg);
                    return;
                }if(msg.code==2){
                    alert("密码错误，请重新输入!");
                    callback(msg.code, msg.msg);
                    return;
                }
                else {
                    alert("未查询到记录!");
                    callback(msg.code, msg.msg);
                    return;
                }

            }
        }
    });
    return true;
}
web3Utils.prototype.register = function () {
    if ($("#user_mobile").val() == "") {
        alert("请输入手机号");
        return;
    }
    if ($("#password").val() == "") {
        alert("请输入密码!");
        return;
    }
    if ($("#password2").val() != $("#password2").val()) {
        alert("密码不一致，请重新请输入密码!");
        return;
    }
    var currentWallet = web3Utils.getCurrentWallet();//        "user_name":encodeURIComponent($(#"user_name").val()),
    var url = web3Utils.nodejs_server + "/action.do?actname=register&account_hash=" + currentWallet;//application/json
    var option = {
        "account_hash": currentWallet,
        "login_name": $("#login_name").val(),
        "password": $("#password").val(),
        "user_mobile": $("#user_mobile").val(),
    };
    $.ajax({
        type: 'POST',
        url: url,
        data: option,
        dataType: "html",
        success: function (vMsg) {
            debugger;
            var msg;
            console.log(vMsg);
            if (vMsg.length > 1) {
                msg = JSON.parse(vMsg);
                alert("提交成功 " + msg.msg);
            } else {
                alert("发生意外错误！");
            }
        }
    });
    return true;

}
web3Utils.prototype.login = function (login_name, password) {
    var currentWallet = web3Utils.getCurrentWallet();
    var url = nodejs_server + "/action.do?actname=login&account_hash=" + currentWallet;//application/json
    var option = {"account_hash": currentWallet, "user_name": login_name, "password": password};
    $.ajax({
        type: 'POST',
        url: url,
        data: option,
        dataType: "html",
        success: function (vMsg) {
            debugger;
            var msg;
            if (vMsg.length > 1) {
                msg = JSON.parse(vMsg);
            } else {
                alert("发生意外错误！");
            }
        }
    });
    return true;
}
web3Utils.prototype.getCurrentWallet = function () {
    var v = localStorage.getItem('current_account');
    if (v == null || v == '') {
        var wallet = web3Utils.getWalletbyIndex(0);
        if (wallet != null) {
            localStorage.setItem('current_account', wallet.account);
            v = wallet.account;
        } else {
            localStorage.setItem('current_account', "");
            v = "";
        }
    }
    return v;
}
web3Utils.prototype.getWalletIndex = function () {
    var account = localStorage.getItem('current_account');
    if (account == "" || account == null) {
        var wallet = web3Utils.getWalletbyIndex(0);
        /* if(wallet !=null){
         localStorage.setItem('current_account',wallet.account);
         }else{
         localStorage.setItem('current_account',"");
         }*/
        return 0;
    }
    var v = localStorage.getItem('allwallets');
    var allwallets = null;
    if (v != "" && v != null) {
        var allwallets = JSON.parse(v);
        for (var i = 0; i < allwallets.length; i++) {
            if (allwallets[i].account == account) {
                return i;
            }
        }
    }
    return 0;
}
web3Utils.prototype.getWalletbyAccount = function (account) {
    if (account == null || account == "") {
        return null;
    }
    var v = localStorage.getItem('allwallets');
    var allwallets = null;
    if (v != "" && v != null) {
        allwallets = JSON.parse(v);
        for (var i = 0; i < allwallets.length; i++) {
            if (account == allwallets[i].account) {
                //localStorage.setItem('current_account',allwallets[i].account);
                return allwallets[i];
            }
        }
        //localStorage.setItem('current_account',allwallets[0].account);
        return allwallets[0];
    } else {
        return null;
    }
}
web3Utils.prototype.getWalletbyIndex = function (index) {
    index = parseInt(index);
    var v = localStorage.getItem('allwallets');
    var allwallets = null;
    if (v != "" && v != null) {
        allwallets = JSON.parse(v);
        if (index < allwallets.length) {
            // localStorage.setItem('current_account',allwallets[index].account);
            return allwallets[index];
        } else {
            // localStorage.setItem('current_account',allwallets[0].account);
            return allwallets[0];
        }
    } else {
        return null;
    }

}

web3Utils.prototype.validateName = function (account_name) {
    var v = localStorage.getItem('allwallets');
    var allwallets = null;
    if (v != "" && v != null) {
        var allwallets = JSON.parse(v);
        for (var i = 0; i < allwallets.length; i++) {
            if (allwallets[i].name == account_name) {
                return false;
            }
        }
    }
    return true;
}
web3Utils.prototype.validateToken = function (account, amount) {
    if (!web3Utils.web3.isConnected()) {
        return '';
    }
    try {
        var vAccount = web3Utils.tokenContract.balanceOf(account);
        if (amount < vAccount) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        return e.message;
    }

}
web3Utils.prototype.validateAccount = function (address) {
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
        // check if it has the basic requirements of an address
        return false;
    } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
        // If it's all small caps or all all caps, return true
        return true;
    } else {
        // Otherwise check each case
        return false;
    }
}
web3Utils.prototype.validatePassword = function (Password) {
    if (Password == null) {
        return false;
    }
    if (Password.length < 6) {
        return false;
    }
    if (!/^(0x)?[0-9a-f]{6}$/i.test(Password)) {
        // check if it has the basic requirements of an address
        return false;
    } else if (/^(0x)?[0-9a-f]{6}$/.test(Password) || /^(0x)?[0-9A-F]{6}$/.test(Password)) {
        // If it's all small caps or all all caps, return true
        return true;
    } else {
        // Otherwise check each case
        return false;
    }
    return true;
}

web3Utils.prototype.loadWallet = function (vAccountName, vKeyStore) {

};

web3Utils.prototype.getAccountByIndex = function (index) {
    var allwallets = web3Utils.getAllWallets();
    if (allwallets.length > index) {
        return allwallets[index].account;
    } else {
        return '';
    }
}
web3Utils.prototype.getLastWallet = function () {
    var v = localStorage.getItem('allwallets');
    var allwallets = null;
    if (v != "" && v != null) {
        allwallets = JSON.parse(v);
        if (allwallets.length > 0) {
            return allwallets[allwallets.length - 1];
        } else {
            return allwallets[0];
        }
    } else {
        return null;
    }
}
web3Utils.prototype.importWallet = function (account_name, password, keystore, callback) {
    var account = localStorage.getItem('current_account');
    var url = web3Utils.nodejs_server + "/action.do?actname=importwallet&account_hash=" + account;
    var option = {
        "account_hash": account,
        "account_name": account_name,
        "password": password,
        "keystore": JSON.stringify(keystore)
    };
    $.ajax({
        type: 'POST',
        url: url,
        data: option,
        dataType: "html",
        success: function (vMsg) {
            var msg;
            console.log(vMsg);
            if (vMsg.length > 1) {
                msg = JSON.parse(vMsg);
                if (msg.code == "1") {
                    msg.data.name = account_name;
                    if (account_name != null || account_name != '') {
                        debugger;
                        var v = localStorage.getItem('allwallets');
                        var allwallets = null;
                        if (v != "" && v != null) {
                            allwallets = JSON.parse(v);
                            allwallets.push(msg.data);
                        } else {
                            allwallets = [msg.data];
                        }
                        localStorage.setItem('allwallets', JSON.stringify(allwallets));
                    }
                    alert("账户创建成功 ！");
                } else {
                    alert("发生意外错误！" + msg.msg);
                }
                callback(msg.code, msg.msg);
            } else {
                msg.msg = '';
                callback(0, msg.msg);
                alert("发生意外错误！");
            }

        }
    });
}
web3Utils.prototype.newWallet = function (account_name, password, callback) {
    var account = localStorage.getItem('current_account');
    var url = web3Utils.nodejs_server + "/action.do?actname=newwallet&account_hash=" + account;
    var msg = {};
    var option = {
        "account_hash": account,
        "password": password,
        "account_name": account_name
    };
    $.ajax({
        type: 'POST',
        url: url,
        data: option,
        dataType: "html",
        success: function (vMsg) {
            console.log(vMsg);
            if (vMsg.length > 1) {
                msg = JSON.parse(vMsg);
                if (msg.code == "1") {
                    msg.data.name = account_name;
                    if (account_name != null || account_name != '') {
                        var v = localStorage.getItem('allwallets');
                        var allwallets = null;
                        if (v != "" && v != null) {
                            allwallets = JSON.parse(v);
                            allwallets.push(msg.data);
                        } else {
                            allwallets = [msg.data];
                        }
                        localStorage.setItem('allwallets', JSON.stringify(allwallets));
                    }
                    alert("账户创建成功！");
                } else {
                    alert("发生意外错误！" + msg.msg);
                }
                callback(msg.code, msg.msg);
            } else {
                msg.msg = '';
                callback(0, msg.msg);
                alert("发生意外错误！");
            }

        },
        error: function (err) {
            msg.msg = '';
            callback(0, msg.msg);
        }
    });
}

web3Utils.prototype.getBalances = function (account, callback) {
    if (account == "") {
        return;
    }
    var url = web3Utils.nodejs_server + "/action.do?actname=getbalance&account_hash=" + account;
    var option = {
        "account_hash": account,
        "account": account
    };
    $.ajax({
        type: 'POST',
        url: url,
        data: option,
        dataType: "html",
        success: function (vMsg) {
            var msg;
            if (vMsg.length > 1) {
                msg = JSON.parse(vMsg);
                //alert("查询成功:"+msg.data);
                callback(msg.code, msg.data);

            } else {
                alert("发生意外错误！");
            }

        }
    });

}

web3Utils.prototype.sendEth = function (from_account, to_account, password, amount, memo, callback) {
    if (from_account == '') {
        debugger;
        from_account = localStorage.getItem('current_account');
    }
    var value = amount;
    if (to_account == '') {
        alert('请输入接收帐号地址');
        return false;
    }
   /*
    if (!web3Utils.web3.isConnected()) {
    web3Utils.getWeb3();
    //web3Utils.loadWallet("", "");
    }
    web3Utils.outPrint("发送ETH");//
    var from_amount = web3Utils.web3.eth.getBalance(from_account);
   var from_amount = web3.toWei(from_amount, 'ether');
    if (from_amount < web3.toWei(amount + 21000, 'ether')) {
        alert('交易失败：余额不足');
        web3Utils.outPrint('error:余额不足');
        callback(0, "余额不足");
        return false;
    }*/
    var wallet = web3Utils.getWalletbyAccount(from_account);
    var url = web3Utils.nodejs_server + "/action.do?actname=sendeth&account_hash=" + wallet.to_account;
    // allwallets.push({"name": account_name, "account": addresses[0],"mnemonic":mnemonic_word, "keystore": web3Utils.keystore})
    var option = {
        "account_hash": wallet.account,
        "password": password,
        "from_account": from_account,
        "to_account": to_account,
        "amount": amount,
        "memo": memo,
        "keystore": JSON.stringify(wallet.keystore)
    };
    $.ajax({
        type: 'POST',
        url: url,
        data: option,
        dataType: "html",
        success: function (vMsg) {
            var msg;
            console.log(vMsg);
            if (vMsg.length > 1) {
                msg = JSON.parse(vMsg);
                if (msg.code == "1") {
                    alert("提交成功 ");
                } else {
                    alert("发生意外！" + msg.msg);
                }
                callback(msg.code, msg.msg);
            } else {
                msg.msg = '';
                callback(0, msg.msg);
                alert("发生意外错误！" + msg.msg);
            }

        }
    });
};

web3Utils.prototype.outPrint = function (vOut) {
    console.log(vOut);
    // document.getElementById('debug_out').innerHTML =document.getElementById('debug_out').innerHTML+"</br>"+ vout;
    // document.getElementById('debug_out').innerHTML +=out+"</br>";
};

web3Utils.prototype.sendToken = function (from_account, to_account, password, amount, memo, callback) {
    debugger;
    if (from_account == '') {
        from_account = localStorage.getItem('current_account');
    }
    var value = amount;
    if (to_account == '') {
        alert('请输入接收帐号地址');
        return false;
    }
    /*
    if (!web3Utils.web3.isConnected()) {
        web3Utils.getWeb3();
    }
    var from_amount = web3Utils.web3.eth.getBalance(from_account);
    // var from_amount=web3.toWei(from_amount,'ether');
    if (from_amount < 210000+amount) {//<web3.toWei(21000,'ether')
     web3Utils.outPrint('error:余额不足');
     alert("余额不足");
     callback(0,"余额不足");
     return false;
     }*/
    web3Utils.outPrint("发送Token");//
    var wallet = web3Utils.getWalletbyAccount(from_account);
    var url = web3Utils.nodejs_server + "/action.do?actname=sendtoken&account_hash=" + wallet.to_account;
    // allwallets.push({"name": account_name, "account": addresses[0],"mnemonic":mnemonic_word, "keystore": web3Utils.keystore})
    var option = {
        "account_hash": wallet.account,
        "password": password,
        "from_account": from_account,
        "to_account": to_account,
        "amount": amount,
        "memo": memo,
        "keystore": JSON.stringify(wallet.keystore)
    };
    $.ajax({
        type: 'POST',
        url: url,
        data: option,
        dataType: "html",
        success: function (vMsg) {
            var msg;
            console.log(vMsg);
            if (vMsg.length > 1) {
                msg = JSON.parse(vMsg);
                if (msg.code == "1") {
                    alert("提交成功！");
                } else {
                    alert("发生意外错误！" + msg.msg);
                }
                callback(msg.code, msg.msg);
            } else {
                msg.msg = '';
                callback(0, msg.msg);
                alert("发生意外错误！" + msg.msg);
            }

        }
    });
};
var web3Utils = new web3Utils();
window.web3Utils = web3Utils;

