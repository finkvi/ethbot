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

const TelegramBot = require('node-telegram-bot-api');

const TOKEN = botconf.telegram_token;
const options = {
  webHook: {
    port: botconf.port
  }
};
const url = botconf.telegram_url;
const bot = new TelegramBot(TOKEN, options);

console.info('Bot WebHook %s сreating...', url);
bot.setWebHook(`${url}/bot${TOKEN}`)
  .then(function(){
      console.info('WebHook created');  
      startDialog();
    }, 
    function(err){
      console.error(err);
      //Падаем
      process.exit(1);
    },
    function(){
      console.info('Progress...');
    }  
);

function startDialog() {
  bot.onText(/\/exit/, function (msg) {
    process.exit(0);
  });
  
  // bot.on('message', function onMessage(msg) {
  //   console.log('Pong');
  //   bot.sendMessage(msg.chat.id, 'Я тебя слышу, выполни /exit, чтобы убить меня').then(function(regmsg){
      
  //     var a = 'Just Parametr';
      
  //     var f = function(regmsg){
  //       console.log(regmsg);
  //       console.log(a);
  //     };
      
  //     bot.sendMessage(msg.chat.id, 'Want to pass param to Promise').then(f);
      
  //   });
  // });
}
