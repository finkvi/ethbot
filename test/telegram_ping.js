////////////////////////CONFIG SECTION////////////////////////////////
const blockchainenv = process.env.BLOCKCHAINCONF || 'development';
const botenv= process.env.BOTCONF || 'vfink_test_bot';

const conf = require('../conf');
const botconf = conf.bot[botenv];
const blockchainconf = conf.blockchain[blockchainenv];
////////////////////////CONFIG SECTION////////////////////////////////

const TelegramBot = require('node-telegram-bot-api');

const TOKEN = botconf.app.telegram_token;
const options = {
  webHook: {
    port: botconf.app.port
  }
};
const url =  botconf.app.telegram_url;
const bot = new TelegramBot(TOKEN, options);

bot.setWebHook(`${url}/bot${TOKEN}`);

bot.onText(/\/exit/, function (msg) {
  process.exit(1);
});

bot.on('message', function onMessage(msg) {
  console.log('Pong');
  bot.sendMessage(msg.chat.id, 'Я тебя слышу, выполни /exit, чтобы убить меня');
})

