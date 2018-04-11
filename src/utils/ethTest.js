//const Wallet = require("ethereumjs-wallet")
var aa={};

exports.createNewAddress = (passphrase) => {
  var newAddress = Wallet.generate()
  console.log(newAddress)
  return newAddress.toV3(passphrase, {kdf: "pbkdf2", c: 10240})
}
/*

let password = "1234";
let newWallet = this.createNewAddress(password);
console.log(newWallet);*/
windows.aa=aa;