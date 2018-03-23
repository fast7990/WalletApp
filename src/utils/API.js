import axios from 'axios'

let API_URL = 'https://2ciyuanjiaoyisuo.cn'
let nodejs_server="";
module.exports = {
	
	queryInfo(user_card, user_mobile,password){
		var currentWallet = web3Utils.getCurrentWallet();
		var wallet = web3Utils.getWalletbyAccount(currentWallet);
		var url = web3Utils.nodejs_server + "/action.do?actname=queryinfo&account_hash=" + currentWallet;//application/json
		var option = {
			"keystore": JSON.stringify(wallet.keystore),
			"account_hash": currentWallet,
			"user_card": user_card,
			"password": password,
			"user_mobile": user_mobile
		}
		return axios({
            method: 'post',
            url,
            data : option
        })
	},
	putInfo(option){
		var currentWallet = web3Utils.getCurrentWallet();
		option.account = currentWallet;
		option.account_hash= currentWallet;
		var url = web3Utils.nodejs_server + "/action.do?actname=putinfo&account_hash=" + currentWallet + "&user_name="
		return axios({
            method: 'post',
            url,
            data : option
        })
	},
    sendEth(from_account, to_account, password, amount, memo){
        if (from_account == '') {
            debugger;
            from_account = localStorage.getItem('current_account');
        }
        var value = amount;
        if (to_account == '') {
            alert('请输入接收帐号地址');
            return false;
        }
        
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
        return axios({
            method: 'post',
            url,
            data : option
        })
    },
	testUsersApi(){
		let url = API_URL+'/api/users/test'
		return axios({
            method: 'get',
            url
        })
	},
	createTweet(user, text, token){
		let url = API_URL+'/api/tweets/createTweet'
		return axios({
			method: 'post',
			url,
			data : {
				user,
				text
			},
			headers: {
				Authorization : token
			}
		})
	},
	getTweets(){
		let url = API_URL+'/api/tweets/getTweets'
		console.log(url)
		return axios.get(url)
	},
	addMore(id, token){
		let url = API_URL+'/api/tweets/addmore'
		console.log(url)
		return axios({
			method: 'post',
			url: url,
			data: { id : id },
			headers: {
				Authorization : token
			}
		})
		
	},
	signUp(email, username, password){
		let url = API_URL+'/api/users/signup'
		return axios.post(url, {
			email,
			username,
			password
		})
		
	},
	login(email, password){
		let url = API_URL+'/api/users/login'
		return axios.post(url, {
			email,
			password
		})
		
	}
}