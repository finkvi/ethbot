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

const TelegramBot = require('node-telegram-bot-api');

const TOKEN = botconfig.app.telegram_token;
const options = {
  webHook: {
    port: botconfig.app.port
  }
};
const url =  botconfig.app.telegram_url;
const bot = new TelegramBot(TOKEN, options);

bot.setWebHook(`${url}/bot${TOKEN}`);

bot.onText(/\/exit/, function (msg) {
  process.exit(1);
});

bot.on('message', function onMessage(msg) {
  console.log('Pong');
  bot.sendMessage(msg.chat.id, 'Я тебя слышу, выполни /exit, чтобы убить меня');
})

