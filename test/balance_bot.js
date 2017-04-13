////////////////////////CONFIG SECTION////////////////////////////////
const blockchainenv = process.env.BLOCKCHAINCONF || 'development';
const botenv= process.env.BOTCONF || 'vfink_test_bot_DEV';

console.log('Starting with ENV:\nBLOCKCHAINCONF %s\nBOTCONF %s', blockchainenv, botenv);

const conf = require('../conf');
const botconf = conf.bot[botenv];
const blockchainconf = conf.blockchain[blockchainenv];
////////////////////////CONFIG SECTION////////////////////////////////

var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(blockchainconf.nodeurl));
const addr = blockchainconf.botbackaddr;

var balance = web3.eth.getBalance(addr);
console.log('Это баланс бота: ' + balance.toString(10));
process.exit(0);