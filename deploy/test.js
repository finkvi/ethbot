var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://node.ethbot.j2u.ru:8081'));
const addr = '0xd304421e38b8A3b10a917A4E38AA3a65d51823F6';

var balance = web3.eth.getBalance(addr);
console.log(balance.toString(10));