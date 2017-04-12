////////////////////////CONFIG SECTION////////////////////////////////
const config = require('../config/config');

var args = process.argv.slice(2);
var blockchain = 'dev'; //dev, testnet, main
var botid = 'vfink_test_bot'; //

if (args[0]) blockchain = args[0];
if (args[1]) botid = args[1];

var blockchainconfig = require('../config/blockchain/'+blockchain);
var botconfig = require('../config/bot/'+botid);
////////////////////////CONFIG SECTION////////////////////////////////

var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(blockchainconfig.nodeurl));
const addr = blockchainconfig.botbackaddr;

var balance = web3.eth.getBalance(addr);
console.log('Это баланс бота: ' + balance.toString(10));
