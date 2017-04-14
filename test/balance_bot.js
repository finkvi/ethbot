require("console-stamp")(console, {
    pattern:"dd.mm.yyyy HH:MM:ss.l",
    metadata:'[' + process.pid + ']',
});
////////////////////////CONFIG SECTION////////////////////////////////
const blockchainenv = process.env.BLOCKCHAINCONF || 'development';
const botenv= process.env.BOTCONF || 'vfink_test_bot_DEV';

console.info('Starting Ethereum Telegram Bot with ENV:', blockchainenv, botenv);
console.info('BLOCKCHAINCONF: %s', blockchainenv);
console.info('BOTCONF: %s',botenv);


const conf = require('../conf');
const botconf = conf.bot[botenv];
const blockchainconf = conf.blockchain[blockchainenv];
////////////////////////CONFIG SECTION////////////////////////////////

var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(blockchainconf.nodeurl));
const addr = blockchainconf.botbackaddr;

try {
    var balance = web3.eth.getBalance(addr);
    console.log('Это баланс бота: ' + balance.toString(10));
    process.exit(0);   
} 
catch (e) {
    console.log("Error connecting Ethereum Node");
    console.error(e);
    //Падаем
    process.exit(1);
}