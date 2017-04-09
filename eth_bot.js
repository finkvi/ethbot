//const TelegramBot = require('./node_modules/node-telegram-bot-api/index.js');
const TelegramBot = require('node-telegram-bot-api');

//const TOKEN = process.env.TELEGRAM_TOKEN || '348777587:AAERq5Z0Bbwp6pXWGFdJ8v_wA_7rrvFLSog';
const TOKEN = process.env.TELEGRAM_TOKEN || '341223987:AAGfy14GlBRSzGVogH4udHq9T8EHCWmHWYI';
const options = {
  webHook: {
    port: 8080
  }
};

var url = 'https://' + process.env.C9_HOSTNAME;
if (!process.env.C9_HOSTNAME) url = 'https://ethbot.j2u.ru:8443';
const bot = new TelegramBot(TOKEN, options);
const botwait = 20000;
const botaddrwait = botwait*10;

var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'ethbot',
  password : 'WGnajF4KDNnMavSD',
  database : 'botdb'
});

connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... nn");    
} else {
    console.log("Error connecting database ... nn");    
    process.exit(1);
}
});

var Web3 = require('web3');
var web3 = new Web3();

const blockchain = 'dev'; //dev, testnet, main
var botaddr = '';
var botgas = '';
var botbackaddr = '';
var botprivateKey = '';

if (blockchain == 'dev') {
  web3.setProvider(new web3.providers.HttpProvider('https://ethbot-finkvi.c9users.io:8081'));
  //Это параметры буфферного контракта на бензин;
  botaddr = '0x94c161e0c7f2c10ecad4c24b34a14e1be5a8ff04';
  botgas = 0.01;
  //Это адрес основного счёта бота, здесь будут копиться все деньги
  botbackaddr = '0xD931856721149Ed5120BfDfde9A222Cfcbe857Fe';
  //Его надо хранить в безопасности, но пока так!!!!!!!!!!!!!!!!
  botprivateKey = new Buffer('93e74a44550665661230a343436ec575c5754a5b0e803c74da67b1fcb4992200', 'hex');
  //Его надо хранить в безопасности!!!!!!!!!!!!!!!!
}
else if (blockchain == 'testnet') {
  //Ropsten на отдельной ноде
  web3.setProvider(new web3.providers.HttpProvider('https://ropsten.infura.io/ethgarantbot'));
  //Это параметры буфферного контракта на бензин;
  botaddr = '0x2a407166493062bAB0A408e944DAFF71538da483';
  botgas = 0.01;
  //Это адрес основного счёта бота, здесь будут копиться все деньги
  botbackaddr = '0xd304421e38b8A3b10a917A4E38AA3a65d51823F6';
  //Его надо хранить в безопасности, но пока так!!!!!!!!!!!!!!!!
  botprivateKey = new Buffer('829a3198a2786268bc0c364b9075043585d8870a74617890aadce6b27106c070', 'hex');
  //Его надо хранить в безопасности!!!!!!!!!!!!!!!!
}
else {
  process.exit(1);
}

const botabi = [{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"benzin","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"},{"payable":true,"type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_from","type":"address"},{"indexed":false,"name":"_value","type":"uint256"},{"indexed":false,"name":"_chatid","type":"bytes"}],"name":"DepositMade","type":"event"}];

//Скомпилированный контракт складчины без параметров
const skladabi = [{"constant":true,"inputs":[],"name":"bot_addr","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"status","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"uchastniki","outputs":[{"name":"addr","type":"address"},{"name":"userid","type":"bytes32"},{"name":"summa","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"srok","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"summa_sklad","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"vozvrat","outputs":[],"payable":true,"type":"function"},{"constant":true,"inputs":[],"name":"derzhatel_addr","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"inputs":[{"name":"_derzhatel_addr","type":"address"},{"name":"_bot_addr","type":"address"},{"name":"_summa_sklad","type":"uint256"},{"name":"_srok","type":"uint256"},{"name":"_uchastniki_addr","type":"address[]"},{"name":"_userid","type":"bytes32[]"}],"payable":false,"type":"constructor"},{"payable":true,"type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_from","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"NewMoney","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_status","type":"uint256"}],"name":"ChangeStatus","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_from","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"SendMoney","type":"event"}];
const skladcode = '0x6060604052341561000c57fe5b60405161088638038061088683398101604090815281516020830151918301516060840151608085015160a086015193959293919290810191015b60008054600160a060020a03808916600160a060020a03199283161783556001805491891691909216179055600285905542603c85020160035560058190555b82518110156101465760048054600181016100a28382610153565b916000526020600020906003020160005b60606040519081016040528087868151811015156100cd57fe5b90602001906020020151600160a060020a0316815260200186868151811015156100f357fe5b602090810291909101810151825260009181019190915281518454600160a060020a031916600160a060020a0390911617845581015160018401556040015160029092019190915550505b600101610087565b5b505050505050506101be565b81548183558181151161017f5760030281600302836000526020600020918201910161017f9190610185565b5b505050565b6101bb91905b808211156101b7578054600160a060020a0319168155600060018201819055600282015560030161018b565b5090565b90565b6106b9806101cd6000396000f300606060405236156100675763ffffffff60e060020a60003504166307fb4e58811461033f578063200d2ed21461036b57806331af22331461038d57806372d8e1a1146103c857806384cd46bc146103ea578063d2f8467f1461040c578063ef92ebde14610416575b61033d5b600060006000600554600014156102c25760003411156102bc5760408051600160a060020a033316815234602082015281517f09df2cb91670081c8e82106028cc3931db1f8e4a1967fad093e4bb858b2cc08f929181900390910190a1506001915060009050805b6004548110156101a75733600160a060020a03166004828154811015156100f657fe5b906000526020600020906003020160005b5054600160a060020a0316141561014957600191503460048281548110151561012c57fe5b906000526020600020906003020160005b50600201805490910190555b60045460025481151561015857fe5b0460048281548110151561016857fe5b906000526020600020906003020160005b5060020154101561018957600092505b818015610194575082155b1561019e576101a7565b5b6001016100d3565b82156102bc5760005460025460408051600160a060020a0390931683526020830191909152805160008051602061066e8339815191529281900390910190a160008054600254604051600160a060020a039092169281156108fc029290818181858888f19350505050151561021857fe5b60015460408051600160a060020a03928316815230909216316020830152805160008051602061066e8339815191529281900390910190a1600154604051600160a060020a039182169130163180156108fc02916000818181858888f19350505050151561028257fe5b6001600581905560408051918252517ff6658b501d055edb49a6cbe68c5c772781280b840609bc8af5698f455a8215399181900360200190a15b5b610335565b60003411156103355760015460408051600160a060020a03928316815230909216316020830152805160008051602061066e8339815191529281900390910190a1600154604051600160a060020a039182169130163180156108fc02916000818181858888f19350505050151561033557fe5b5b5b5b505050565b005b341561034757fe5b61034f610442565b60408051600160a060020a039092168252519081900360200190f35b341561037357fe5b61037b610451565b60408051918252519081900360200190f35b341561039557fe5b6103a0600435610457565b60408051600160a060020a039094168452602084019290925282820152519081900360600190f35b34156103d057fe5b61037b610494565b60408051918252519081900360200190f35b34156103f257fe5b61037b61049a565b60408051918252519081900360200190f35b61033d6104a0565b005b341561041e57fe5b61034f61065e565b60408051600160a060020a039092168252519081900360200190f35b600154600160a060020a031681565b60055481565b600480548290811061046557fe5b906000526020600020906003020160005b5080546001820154600290920154600160a060020a03909116925083565b60035481565b60025481565b6000600060035442101580156104b65750600554155b1561065957600091505b6004548210156105b5576004546002548115156104d957fe5b049050806004838154811015156104ec57fe5b906000526020600020906003020160005b5060020154106105a957600480548390811061051557fe5b906000526020600020906003020160005b5054604051600160a060020a039091169082156108fc029083906000818181858888f19350505050151561055657fe5b60008051602061066e83398151915260048381548110151561057457fe5b906000526020600020906003020160005b505460408051600160a060020a039092168252602082018490528051918290030190a15b5b6001909101906104c0565b60015460408051600160a060020a03928316815230909216316020830152805160008051602061066e8339815191529281900390910190a1600154604051600160a060020a039182169130163180156108fc02916000818181858888f19350505050151561061f57fe5b6002600581905560408051918252517ff6658b501d055edb49a6cbe68c5c772781280b840609bc8af5698f455a8215399181900360200190a15b5b5050565b600054600160a060020a0316815600c957d95850105ff100344003b8fa6b64196eb8f8b16ff28e111a87dee1a01c49a165627a7a72305820bd6ea64d844d4c3811cc1a588f66a5bc70a6814f2cf1a35939e3bf196da451970029';

bot.setWebHook(`${url}/bot${TOKEN}`);
bot.getMe().then(function(me)
{
    console.log('Hello! My name is %s!', me.first_name);
    console.log('My id is %s.', me.id);
    console.log('And my username is @%s.', me.username);
    console.log('URL: ' + url);
});

bot.onText(/\/start/, function onStartReg(msg) {
  //console.log('Msg: ', msg);
  //Проверяем есть ли уже запись о регистрации складчины в базе для этого чата
  connection.query('SELECT * FROM CHATS WHERE CHATID = ' + connection.escape(msg.chat.id) + ' LIMIT 1', function(err, rows, fields) {
      if (!err){
        if (!rows.length) {
          //console.log('Creating new record about chat');
          connection.query('INSERT INTO CHATS SET ?', {
                            CHATID: msg.chat.id,
                            TITLE:  String(msg.chat.title)
                            }, 
          function (error, results, fields) {
            if (error) throw error;
            //console.log(results.insertId);
            //Создаем запрос о регистрации в складчине
            var options = {
              reply_markup: JSON.stringify({
                inline_keyboard: [
                  [{ text: 'Да', callback_data: 'RegYes'},{ text: 'Нет', callback_data: 'RegNo' }]
                ]
              })
            };
            var s = 'Будете ли вы участвовать в складчине?\n';
            s += 'У вас есть ' + botwait/1000 + ' секунд для регистрации';
            bot.sendMessage(msg.chat.id, s, options).then(function (regmsg) {
              //console.log (regmsg);
              setTimeout(function() {
                bot.editMessageReplyMarkup( JSON.stringify({inline_keyboard: []}), 
                                        {chat_id: regmsg.chat.id, 
                                        message_id: regmsg.message_id,             
                                        });
                connection.query("SELECT USERID, USERFSTNAME, USERLSTNAME FROM CHATS_MEM WHERE CHATID = " + connection.escape(regmsg.chat.id) + " AND STATUS = \'RegYes\'", 
                function (err, rows, fields) {
                  if (err) throw err;
                  if (rows.length) {
                    var sReg = '';
                    for (var i = 0; i < rows.length; i++) {
                      sReg = sReg + rows[i].USERFSTNAME + ' ' + rows[i].USERLSTNAME + '\n';
                    }
                    sReg = 'Итого зарегистрировались: \n' + sReg + 'Только эти участники смогут скидываться';
                    bot.sendMessage(msg.chat.id, sReg);
                    
                    //Поехали выбирать держателя складчин
                    setBenefit(msg.chat.id, rows);
                  }
                  else {
                    connection.query('DELETE FROM CHATS WHERE CHATID =' + connection.escape(regmsg.chat.id));
                    bot.sendMessage(msg.chat.id, 'Никто не зарегистрировался, запустите меня заново /start');
                  }
                });
              }, botwait);
            }); 
          }); 
        }
        else
          bot.sendMessage(msg.chat.id, 'Для этого чата уже есть запись о регистрации складчины. Используйте новый чат или продолжайте процесс в этом');
      }
      else {
        console.log('SQL Error while performing Query.');
      }
    });
});

/*Пока отключаю
bot.onText(/\/ben/, function onSetBenefit(msg) {
  connection.query("SELECT USERID, USERFSTNAME, USERLSTNAME FROM CHATS_MEM WHERE CHATID = " + connection.escape(msg.chat.id) + " AND STATUS = \'RegYes\'", 
                function (err, rows, fields) {
                  if (err) throw err;
                  if (rows.length) setBenefit(msg.chat.id, rows);
                }
  );
});
*/

/*
bot.onText(/\/goal/, function onSetGoal(msg) {
  setGoal(msg.chat.id, '295161539', 'Direct Call', 'siebel');
});

bot.onText(/\/dl/, function onSetDeadline(msg) {
  setDeadline(msg.chat.id, '295161539', 'Direct Call', 'siebel', 8);
});

bot.onText(/\/a/, function onSetDeadline(msg) {
  getMemAddr(msg.chat.id, '295161539', 'Direct Call', 'siebel', 8, 180);
});

bot.onText(/\/g/, function onSetDeadline(msg) {
  getGasFromBen(msg.chat.id, '295161539', 'Direct Call', 'siebel', 8, 180);
});
*/

bot.onText(/\/waitbenz/, function (msg) {
  connection.query("SELECT CONTRACT_ADDRESS FROM CHATS WHERE CHATID = " + connection.escape(msg.chat.id) + " AND STATUS = \'CONFIRM\' LIMIT 1", 
    function (err, rows, fields) {
      if (err) throw err;
      if (rows.length) {
          checkGasForMe(msg.chat.id, rows[0].CONTRACT_ADDRESS);
      }
  });
});

bot.onText(/\/deploy/, function (msg) {
  connection.query("SELECT ID FROM CHATS WHERE CHATID = " + connection.escape(msg.chat.id) + " AND STATUS = \'PAID\' LIMIT 1", 
    function (err, rows, fields) {
      if (err) throw err;
      if (rows.length) {
          deployContract(msg.chat.id);
      }
  });
});

bot.onText(/\/waittrans/, function (msg) {
  connection.query("SELECT CONTRACT_ADDRESS, STARTBLOCK FROM CHATS WHERE CHATID = " + connection.escape(msg.chat.id) + " AND STATUS = \'MINED\' LIMIT 1", 
    function (err, rows, fields) {
      if (err) throw err;
      if (rows.length) {
          waitTransactions(msg.chat.id, rows[0].STARTBLOCK, rows[0].CONTRACT_ADDRESS);
      }
  });
});

bot.onText(/\/status/, function (msg) {
  skladstatus(msg.chat.id);
});

bot.onText(/\/vozvr/, function (msg) {
  skladvozvr(msg.chat.id);
});

//Выбор держателя складчины
function setBenefit(chatid, mems){
  //bot.sendMessage(chatid, 'Выбираем');
  var kb = [
  ];
  for (var i=0; i < mems.length; i++) {
    kb.push([{text: mems[i].USERFSTNAME + ' ' + mems[i].USERLSTNAME, callback_data: 'U' + mems[i].USERID}]);
  }
  var options = {
              reply_markup: JSON.stringify({
                inline_keyboard: kb
              })
            };  
  bot.sendMessage(chatid, 'Теперь выберите держателя складчины', options).then(function (regmsg) {
    setTimeout(function() {
      //Убираем клавиши
      bot.editMessageReplyMarkup( JSON.stringify({inline_keyboard: []}), 
                        {chat_id: regmsg.chat.id, 
                        message_id: regmsg.message_id,             
                        });
      //Объявляем победителя
      connection.query("SELECT USERID, USERNAME, USERFSTNAME, USERLSTNAME FROM CHATS_MEM WHERE CHATID = " + connection.escape(chatid) + " ORDER BY VOTE DESC LIMIT 1", 
        function (err, rows, fields) {
          if (err) throw err;
          if (rows.length) {
            var sName = rows[0].USERFSTNAME + ' ' + rows[0].USERLSTNAME;
            var iUserId = rows[0].USERID;
            var sLogin = rows[0].USERNAME;
            connection.query('UPDATE CHATS SET BEN_USER = ' + rows[0].USERID + ' WHERE CHATID = ' + connection.escape(chatid), 
              function (err, rows, fields) {
                if (err) throw err;
                  bot.sendMessage(chatid, 'Держателем складчины выбран: ' + sName).then (function (regmsg) {
                    //Опрашиваем держателя о сумме и сроке
                    setGoal (chatid, iUserId, sName, sLogin);
                  });
              });
          }
      });
     }, botwait);
  });
}

//Редактирование сообщения о выборе держателя складчины
function editBenefitMsg(chatid, msgid, txt){
  connection.query("SELECT USERID, USERFSTNAME, USERLSTNAME FROM CHATS_MEM WHERE CHATID = " + connection.escape(chatid) + " AND STATUS = \'RegYes\'", 
    function (err, rows, fields) {
      if (err) throw err;
      var kb = [];
      for (var i=0; i < rows.length; i++) {
        kb.push([{text: rows[i].USERFSTNAME + ' ' + rows[i].USERLSTNAME, callback_data: 'U' + rows[i].USERID}]);
      }

      bot.editMessageText(txt, {chat_id: chatid, 
                                message_id: msgid,             
                                reply_markup: JSON.stringify({
                                  inline_keyboard: kb
                                })
      });
  });
}

//Опрос держателя о сумме
function setGoal(chatid, userid, userfullname, login){
  var opts = {
    reply_markup: JSON.stringify(
      {
        force_reply: true,
        selective: true
      }
    )};
  
  //Проверка, что у держателя заполнен логин
  if (login !== 'undefined'){
    var mention = '@' + login;
    //bot.sendMessage(chatid, userfullname + ', сколько денег собираем? В эфирах и через точку', opts);
    //Опрашиваем держателя о сумме и сроке
    var ex_rate = require('./exchange_rate_native');
    ex_rate.getrate (function (rate) {
      bot.sendMessage(chatid, mention  + ' сколько денег собираем? \n' + rate, opts).then (
        function (goal) {
          //console.log(goal);
          bot.onReplyToMessage(chatid, goal.message_id, function repGoal (goalmsg) {
            console.log('SET GOAL!!!!!');
            //Проверяем тот ли пользователь ответил, ответ может быть в ручном режиме
            if (userid == goalmsg.from.id){
              //Проверяем состояние чата для возможности изменения, модель состояния чата: NEW - SET - CONFIRM - DEPLOY - CLOSED
              var goal = parseFloat(goalmsg.text);
              if (goal) {
                connection.query("SELECT CHATID FROM CHATS WHERE STATUS = \'NEW\' AND CHATID=" + connection.escape(chatid), 
                function (err, rows, fields) {
                  if (err) throw err;
                  if (rows.length) {
                    //Обновляем цель
                    connection.query("UPDATE CHATS SET GOAL = " + goal + " WHERE CHATID = " + connection.escape(chatid), 
                      function (err, rows, fields) {
                        if (err) throw err;
                        console.log('Круто, переходим к сроку');
                        setDeadline(chatid, userid, userfullname, login, goal);
                      });
                  }
                  else {
                    bot.sendMessage(chatid, 'На данной стадии редактрование цели уже невозможно');
                  }
                });
              }
              else {
                bot.sendMessage(chatid, 'Кривые руки? А ещё держатель... Присылай ответом на сообщение корректную цифру', {reply_to_message_id: goalmsg.message_id});
              }
            }
            else {
              bot.sendMessage(chatid, 'Уважаемый, не пытайся меня наебать, ты не деражатель складчины!', {reply_to_message_id: goalmsg.message_id});
            }
            
            //console.log(goalmsg);
          });
      });
    });
  }
  else {
    bot.sendMessage(chatid, 'Уважаемый, ' + userfullname + '! Заполни свой username, чтобы я смог к тебе обращаться').then (function (loginmsg){
      //Может допишем ожидалку
    }); 
  }
}

function setDeadline (chatid, userid, userfullname, login, goal){
  //Проверка, что у держателя заполнен логин
  if (login !== 'undefined'){
    var keyboard = [
        ['5 минут', '15 минут', '30 минут'],
        ['1 час', '3 часа', '12 часов'],
        ['1 день', '5 дней', '30 дней'],
             ['1 год']
      ];
    var opts = {
      reply_markup: JSON.stringify(
        {
          force_reply: true,
          selective: true,
          one_time_keyboard: true,
          keyboard: keyboard
        }
      )};
    
    var mention = '@' + login;
    //Опрашиваем держателя о сроке, просим кол-во минут
    bot.sendMessage(chatid, mention  + ' сколько времени будем собирать?', opts).then (
      function (time) {
        //console.log(time);
        bot.onReplyToMessage(chatid, time.message_id, function repTime (timemsg) {
          console.log('SET DEALINE!!!!!');
          //Проверяем тот ли пользователь ответил, ответ может быть в ручном режиме
          if (userid == timemsg.from.id){
            //Проверяем состояние чата для возможности изменения, модель состояния чата: NEW - SET - CONFIRM - DEPLOY - CLOSED
            var interval = parseInt(timemsg.text, 10);
            if (timemsg.text.indexOf('мин') > -1){
              interval = interval;
            }
            else if (timemsg.text.indexOf('час') > -1) {
              interval = 60 * interval;
            }
            else if ((timemsg.text.indexOf('день') > -1) || (timemsg.text.indexOf('дн') > -1)) {
              interval = 60 * 24 * interval;
            }
            else if (timemsg.text.indexOf('год') > -1) {
              interval = 60 * 24 * 365 * interval;
            }
            else {
              //минуты по умолчанию
              interval = interval;
            }
            
            if (interval) {
              connection.query("SELECT CHATID FROM CHATS WHERE STATUS = \'NEW\' AND CHATID=" + connection.escape(chatid), 
              function (err, rows, fields) {
                if (err) throw err;
                if (rows.length) {
                  //Обновляем интервал для дедлайна, значение в минутах и завершаем сбор параметров
                  connection.query("UPDATE CHATS SET `INTERVAL` = " + interval + ", `STATUS` = \'SET\' WHERE CHATID = " + connection.escape(chatid), 
                    function (err, rows, fields) {
                      if (err) throw err;
                      console.log('Параметры заданы, утверждаем их сбором номеров кошельков');
                      getMemAddr(chatid, userid, userfullname, login, goal, interval);
                    });
                }
                else {
                  bot.sendMessage(chatid, 'На данной стадии редактрование цели уже невозможно');
                }
              });
            }
            else {
              bot.sendMessage(chatid, 'Кривые руки? А ещё держатель... Присылай ответом на сообщение корректную цифру', {reply_to_message_id: timemsg.message_id});
            }
          }
          else {
            bot.sendMessage(chatid, 'Уважаемый, не пытайся меня наебать, ты не деражатель складчины!', {reply_to_message_id: timemsg.message_id});
          }
          
          //console.log(timemsg);
        });
    });
  }
  else {
    bot.sendMessage(chatid, 'Уважаемый, ' + userfullname + '! Заполни свой username, чтобы я смог к тебе обращаться').then (function (loginmsg){
      //Может допишем ожидалку
    }); 
  }
}

//Собираем номера кошельков
function getMemAddr (chatid, userid, userfullname, login, goal, interval) {
  var txt = 'Складчина готова к старту \n';
  txt += 'Её держателем является ' + userfullname + ' с логином @' + login + '\n'; 
  txt += 'Общая сумма складчины ' + goal + ' ETH. Продолжительность сбора ' + interval + 'мин. \n';
  txt += 'Следующим сообщением я попрошу каждого прислать мне номер своего Эфир кошелька для отслеживания платежей \n';
  txt += 'Отправка адреса подтверждает ваше участие в складчине. Будте внимательны, вводите корректные адреса';
  
  bot.sendMessage(chatid, txt).then(function () {
    var opts = {
    reply_markup: JSON.stringify({
        force_reply: true
      }
    )};
    
    var alladr = false;
    
    bot.sendMessage(chatid, 'Укажите адрес кошелька', opts).then(function(addrreq) {
      bot.onReplyToMessage(chatid, addrreq.message_id, function (addrmsg) {
        if (web3.isAddress(addrmsg.text)) {
          connection.query("UPDATE CHATS_MEM SET `STATUS` = \'CONFIRM\', `USER_ADDRESS` = \'" + addrmsg.text + "\' WHERE STATUS = \'RegYes\' AND CHATID = " + connection.escape(chatid) + " AND USERID = " + connection.escape(addrmsg.from.id), 
                  function (err, rows, fields) {
                      if (err) throw err;
                      console.log('Записал номер кошелька для пользователя:' + addrmsg.from.username);
                      //Будем проверять, что все участники прислали адреса
                      connection.query("SELECT CHATID FROM CHATS_MEM WHERE CHATID = " + connection.escape(chatid) + " AND STATUS = \'RegYes\' AND USER_ADDRESS IS NULL LIMIT 1", 
                              function (err, rows, fields) {
                                  if (err) throw err;
                                  if (!rows.length) {
                                    //Закрываем сбор параметров
                                    var sql = "UPDATE `CHATS` C SET C.`STATUS`=\'CONFIRM\'\n"
                                            + ",C.`BENEFIT_ADDRESS`= (SELECT USER_ADDRESS\n"
                                            + " FROM CHATS_MEM M\n"
                                            + " WHERE C.CHATID = M.CHATID AND C.BEN_USER = M.USERID\n"
                                            + " )\n"
                                            + "WHERE C.`CHATID` = " + connection.escape(chatid);
                                    
                                    connection.query(sql, function (err, rows, fields) {
                                      if (err) throw err;
                                      alladr = true;
                                      console.log('Все прислали адреса!');
                                      getGasFromBen(chatid, userid, userfullname, login, goal, interval);
                                    });                                    
                                  }
                                  else {
                                    console.log('Ждём адресов!');
                                  }
                                });
                    });
        }
        else {
          bot.sendMessage(chatid, 'Это НЕ адрес кошелька, укажи корректный адрес',  {reply_to_message_id: addrmsg.message_id});
        }
      });
      //Здесь вводим ограничение по сроку отправки адресов, допишем позже
      setTimeout(function() {
        if (!alladr) {
          console.log('Время на сбор адресов вышло, переходим далее принудительно');
          //getGasFromBen(chatid, userid, userfullname, login, goal, interval);
        }
      }, botaddrwait);
      
    });
  });
}

//Печатаем Объявляем всем по сколько скидываемся и просим на бензин
function getGasFromBen(chatid, userid, userfullname, login, goal, interval){
  connection.query("SELECT USER_ADDRESS, USERNAME FROM CHATS_MEM WHERE CHATID = " + connection.escape(chatid) + " AND STATUS = \'CONFIRM\'", 
    function (err, rows, fields) {
        if (err) throw err;
        if (rows.length) {
          var txt = 'Почти готово \n'; 
          txt += 'Список адресов кошельков и участников следующий: \n';
          for (var i=0; i < rows.length; i++){
            txt += String(rows[i].USER_ADDRESS) + ' - @' + String(rows[i].USERNAME) + '\n';
          }
          // txt += 'Все должны скинуться по: ' + Math.ceil(100000*goal/3)/100000;
          txt += 'Все должны скинуться по: ' + Math.ceil(100000*goal/rows.length)/100000 + ' ETH\n';
          txt += 'Мне потребуется немного на бензин, как только меня заправят, я создам контракт в Эфире\n';
          txt += 'По правилам заправлять будет держатель складчины @' + login;
          //получим адрес держателя
          connection.query("SELECT BENEFIT_ADDRESS FROM CHATS WHERE CHATID = " + connection.escape(chatid), 
            function (err, rows, fields) {
              if (err) throw err;
              if (rows.length) {
                var addr = rows[0].BENEFIT_ADDRESS;
                bot.sendMessage(chatid, txt).then(function () {
                  txt = '@' + login + ' переведи мне ' + botgas + ' ETH на адрес\n' + botaddr + '\n';
                  txt += 'Укажи в данных к транзакции следующий код: \n'+ web3.sha3(web3.toHex(chatid)) +'\n';
                  txt += 'Внимание! Неидентифицированные платежи (без указания кода) идут в мою пользу\n';
                  txt += 'Я жду...';
                  bot.sendMessage(chatid, txt).then(function(gasreq) {
                    //Тут начались финансы, пора сохранить номер блока с него будем все проверки начинать, чтобы не тормозило
                    //сложим в базу
                    var startblock = web3.eth.blockNumber;
                    connection.query("UPDATE CHATS SET `STARTBLOCK` = " + startblock + " WHERE CHATID = " + connection.escape(chatid), 
                      function (err, rows, fields) {
                        if (err) throw err;
                        checkGasForMe(chatid, addr);
                    });
                });
              });
              }
          });
        }
        else {
          console.log('Херь какая-то в данных');
          bot.sendMessage(chatid, 'Нет присланных адресов');
        }
      });
}

function checkGasForMe(chatid, addr) {
  console.log('Адрес держателя: ' + addr);
  console.log('Адрес меня: ' + botaddr);
  
  var startblock = web3.eth.blockNumber;
  var contract = web3.eth.contract(botabi).at(botaddr);
  var myEvent = contract.DepositMade({}, {fromBlock: startblock, toBlock: 'latest'});
  myEvent.watch(function(error, result){
    if (!error) {
      var sum = web3.fromWei(result.args._value.toString(10), 'ether');
      var chatidhash = (web3.sha3(web3.toHex(chatid)));
      if (addr.toLowerCase() == result.args._from.toLowerCase() && result.args._chatid.toLowerCase() == chatidhash.toLowerCase()){
        //Обновляем статус чата в базе
        connection.query("UPDATE CHATS SET STATUS = \'PAID\' WHERE CHATID = " + connection.escape(chatid), 
            function (err, rows, fields) {
              if (err) throw err;
              bot.sendMessage(chatid, 'Пришла транзакция на ' + sum + ' ETH, я заправлен. Начинаю создавать контракт на складчину в Эфире').then(function (msg) {
                myEvent.stopWatching();
                deployContract (chatid);
              });
            }
        );
      }
      else {
        console.log('Пришла не та транзакция');
        console.log(result.args._from);
        console.log(sum + ' ETH');
      }    
    }
  });
}

function deployContract(chatid) {
  //Собираем параметры из базы
  connection.query("SELECT * FROM CHATS WHERE CHATID = " + connection.escape(chatid), 
  function (err, rows, fields) {
    if (err) throw err;
    if (rows.length) {
      var _derzhatel_addr = String(rows[0].BENEFIT_ADDRESS);
      var _bot_addr = botbackaddr;
      var _summa_sklad = web3.toWei(rows[0].GOAL, 'ether');
      var _srok = rows[0].INTERVAL;
      var addr = [];
      var userid = [];
      connection.query("SELECT USER_ADDRESS, USERNAME FROM CHATS_MEM WHERE CHATID = " + connection.escape(chatid) + " AND STATUS = \'CONFIRM\'", 
      function (err, rows, fields) {
        if (err) throw err;
        for (var i = 0; i < rows.length; i++) {
          addr.push(rows[i].USER_ADDRESS);
          userid.push(rows[i].USERNAME);
        }
      
        var _uchastniki_addr = addr;
        var _userid = userid;
        
        //Кодируем параметры
        var SolidityCoder = require("web3/lib/solidity/coder.js");
        var encodePar = SolidityCoder.encodeParams(["address", "address", "uint256", "uint256", "address[]", "bytes32[]"], 
                                                  [_derzhatel_addr, _bot_addr, _summa_sklad, _srok, _uchastniki_addr, _userid]);
        
        //Скомпилированный контракт
        var data = skladcode;
        data += encodePar;
        
        //Создаем траназкцию
        var Transaction = require ('ethereumjs-tx');
        var tx = new Transaction(null, 1);
        tx.nonce = web3.toHex(web3.eth.getTransactionCount(_bot_addr));
        //tx.gasPrice = web3.toHex(web3.eth.gasPrice);
        //tx.gasLimit = web3.toHex(300000);
        tx.value = 0;
        tx.gas = 4700000;
        tx.data = data;

        //Подписываем транзакцию
        tx.sign(botprivateKey); 
        
        //Отправляем
        web3.eth.sendRawTransaction('0x' + tx.serialize().toString('hex'), function(err, hash) {
          var txt = '';
          if (!err) {
            console.log(web3.eth.getTransaction(hash));
            
            txt = 'Транзакция на создание контракта отправлена успешно\n';
            txt += 'Хэш транзакции: ' + hash + '\n';
            txt += 'Дополнительную информацию о статусе транзакции можно посмотреть здесь \n';
            txt += 'https://etherscan.io/tx/' + hash + '\n';
            txt += 'Я жду майнинга транзакции контракта скалдчины...';
            
            bot.sendMessage(chatid, txt).then(function(msg){
              console.log('Мутим фильтр');
              waitContract(chatid, hash);
            });
          }
          else {
            console.log(err);
            txt = 'Ошибка отправки транзакции на создание контракта: ' + err + '\n';
            txt += 'Попробуйте выполнить команду /deploy, чтобы повторить отправку';
            bot.sendMessage(chatid, txt);
          }
      });
      });
    }
  });
}

function waitContract(chatid, hash) {
  var  filter = web3.eth.filter('latest');
  filter.watch(function(error, result) {
    if (!error){
      var receipt = web3.eth.getTransactionReceipt(hash);
      if (receipt && receipt.transactionHash == hash) {
        console.log('Намайнили контракт для чата ' +  chatid + ' Address: ' + receipt.contractAddress);
        filter.stopWatching();
        //Обновляем статус чата в базе
        var startblock = web3.eth.blockNumber;
        connection.query("UPDATE CHATS SET STATUS = \'MINED\', STARTBLOCK=" + startblock + ", CONTRACT_ADDRESS = '" + receipt.contractAddress + "' WHERE CHATID = " + connection.escape(chatid), 
          function (err, rows, fields) {
            if (err) throw err;
            var txt = 'Контракт успешно создан в Эфире\n';
            txt+='Его адрес: ' + receipt.contractAddress + '\n';
            txt+='Всем участникам складчины переводить деньги на ЭТОТ адрес!\n';
            txt+='Когда все участники скинутся, складчина завершится и средства поступят на счет держателя\n';
            txt+='Узнать статус сбора можно командой /status \n';
            txt+='Завершить складчину по истечению срока можно командой /vozvr \n';
            txt+='Я буду сообщать о поступлениях сюда...';
            bot.sendMessage(chatid, txt).then(function (msg) {
              waitTransactions(chatid, startblock, receipt.contractAddress);
            });
        });
      }  
    }
  });
}

//Ждём транзакций
function waitTransactions (chatid, startblock, conaddr){
  var contract = web3.eth.contract(skladabi).at(conaddr);
  
  //Новые деньги
  var NewMoney = contract.NewMoney({}, {fromBlock: startblock, toBlock: 'latest'});
  NewMoney.watch(function(error, result){
    if (!error) {
      var sum = web3.fromWei(result.args._value.toString(10), 'ether');
      var from = result.args._from;
      bot.sendMessage(chatid, 'Пришла транзакция на ' + sum + ' ETH с адреса ' + from);
    }
    else {
        //При ошибке убиваем фильтр
        NewMoney.stopWatching();
        console.log(error);
      }    
  });
  
  //Раздача денег
  var SendMoney = contract.SendMoney({}, {fromBlock: startblock, toBlock: 'latest'});
  SendMoney.watch(function(error, result){
    if (!error) {
      var sum = web3.fromWei(result.args._value.toString(10), 'ether');
      var from = result.args._from;
      bot.sendMessage(chatid, 'Отправил ' + sum + ' ETH на адрес ' + from);
    }
    else {
        SendMoney.stopWatching();
        console.log(error);
      }    
  });
  
  //Статус складчины
  var ChangeStatus = contract.ChangeStatus({}, {fromBlock: startblock, toBlock: 'latest'});
  ChangeStatus.watch(function(error, result){
    if (!error) {
      var status = result.args._status.toString(10);
      var txt = '';
      if (status == 1) {
        txt = 'Складчина успешно завершена, средства отправлены держателю';
      }
      else if (status == 2) {
        txt = 'Складчина просрочена, средства возвращены участникам';
      }
      
      bot.sendMessage(chatid, txt).then(function(msg){
        NewMoney.stopWatching();
        SendMoney.stopWatching();
        ChangeStatus.stopWatching();
        
        //Валим
        connection.query("UPDATE CHATS SET STATUS = \'DONE" +  status + "\' WHERE CHATID = " + connection.escape(chatid), 
          function (err, rows, fields) {
            if (err) throw err;
            txt = 'Я закончил свою работу. До новых встреч! \n';
            txt+= 'Написать разработчику можно сюда vfink@tsconsulting.ru';
            bot.sendMessage(chatid, txt);
          });
      });
    }
    else {
        ChangeStatus.stopWatching();
        console.log(error);
      }    
  });
}

//Получение статуса складчины по запросу
function skladstatus (chatid) {
  connection.query("SELECT STATUS, CONTRACT_ADDRESS FROM CHATS WHERE CHATID = " + connection.escape(chatid), 
    function (err, rows, fields) {
      if (err) throw err;
      if (rows.length) {
        var status = rows[0].STATUS;
        var conaddr = rows[0].CONTRACT_ADDRESS;
        
        var txt = '';
        
        if (status == 'NEW'){
          txt += 'Складчина только создаётся';
          bot.sendMessage(chatid, txt);
        }        
        else if (status == 'SET'){
          txt += 'Установлены параметры складчины';
          bot.sendMessage(chatid, txt);
        }        
        else if (status == 'CONFIRM'){
          txt += 'Складчина подтверждена сбором адресов кошельков';
          bot.sendMessage(chatid, txt);
        }       
        else if (status == 'PAID'){
          txt += 'Складчина получила средства на бензин и ожидает создание контракта в Эфире';
          bot.sendMessage(chatid, txt);
        }   
        else if (status == 'MINED'){
          txt += 'Складчина создана в Эфире\n';
          getConSklad(chatid, conaddr, function (state) {
            txt+=state;
            bot.sendMessage(chatid, txt);
          });
        }        
        else if (status == 'DONE1'){
          txt += 'Складчина успешно завершена, средства отправлены держателю\n';
          getConSklad(chatid, conaddr, function (state) {
            txt+=state;
            bot.sendMessage(chatid, txt);
          });
        }        
        else if (status == 'DONE2'){
          txt += 'Складчина просрочена, средства возвращены участникам\n';
          getConSklad(chatid, conaddr, function (state) {
            txt+=state;
            bot.sendMessage(chatid, txt);
          });
        }
      }  
  });
}

function getConSklad(chatid, addr, cb){
  var sql = "SELECT COUNT(ID) AS C FROM `CHATS_MEM` WHERE `CHATID` =" + chatid;
  connection.query(sql, function (err, rows, fields) {
    if (err) throw err;
    if (rows.length) {
      getConSkladEth (addr, rows[0].C, cb);
    }
  });
}

function getConSkladEth (addr, memscount, cb){
  var d = new Date();
  var state = 'Текущее состояние контракта на ' + d.toISOString().replace(/T/, ' ').replace(/\..+/, '') +':\n';
  state+='Адрес контракта: ' + addr + '\n';
  var contract = web3.eth.contract(skladabi).at(addr);
  var status = contract.status.call().toString(10);
  if (status == '0') status = '0-Идет сбор';
  if (status == '1') status = '1-Состоялась';
  if (status == '2') status = '2-Не состоялась';
  state+='Статус: ' + status + '\n';
  
  var srok =  contract.srok.call().toString(10);
  var a = new Date(srok * 1000);
  state+= 'Срок окончания: ' + a.toISOString().replace(/T/, ' ').replace(/\..+/, '')  + '\n';
  
  var summa_sklad =  web3.fromWei(contract.summa_sklad.call().toString(10), 'ether');
  state+='Сумма складчины: ' + summa_sklad + ' ETH\n';

  var derzhatel_addr = contract.derzhatel_addr.call();
  state+= 'Адрес кошелька держателя: ' + derzhatel_addr + '\n';
  
  var bot_addr = contract.bot_addr.call();
  state+= 'Адрес кошелька бота: ' + bot_addr + '\n';
  
  var stateuch ='Участники и суммы: \n';
  for (var i=0; i < memscount; i++) {
    var u = contract.uchastniki.call(i);
    stateuch += 'Участник #' + i + ':\nАдрес: '+ u[0] + '\n' 
    + 'Логин: @' + (web3.toAscii(u[1])).replace(/\u0000/g, '') + '\n' 
    + 'Сумма: ' + web3.fromWei(u[2].toString(10), 'ether') + ' ETH\n';
  }
  state += stateuch;
  
  if (cb) cb(state);
  
}

//Вызов транзакции на возврат складчины
function skladvozvr(chatid) {
  connection.query("SELECT STATUS, CONTRACT_ADDRESS FROM CHATS WHERE CHATID = " + connection.escape(chatid), 
    function (err, rows, fields) {
      if (err) throw err;
      if (rows.length) {
        var status = rows[0].STATUS;
        var conaddr = rows[0].CONTRACT_ADDRESS;
        
        var txt = '';
        
        if (status == 'MINED'){
          var contract = web3.eth.contract(skladabi).at(conaddr);
          var srok =  contract.srok.call().toString(10);
          var a = new Date(srok * 1000);
          var d = new Date();
          if (a < d) {
            
            //Создаем траназкцию
            var Transaction = require('ethereumjs-tx');
            //Вот такую транзакцию надо воспроизвести
            //{"nonce":"0x0c","gasPrice":"0x04a817c800",
            //"gasLimit":"0x47b760",
            //"to":"0x102b21bbc8d374d970bc0f4f84c3cc866cae8a65",
            //"value":"0x00","data":"0xd2f8467f","chainId":1}
            
            var tx = new Transaction(null, 1);
            tx.nonce = web3.toHex(web3.eth.getTransactionCount(botbackaddr));
            
            tx.gasPrice = web3.toHex(web3.eth.gasPrice);
            tx.gasLimit = web3.toHex(300000);
            tx.value = '0x00';
            tx.to = web3.toHex(conaddr);
            //tx.gas = 4700000;
            //Вот тут походу вызов функции vozvrat сидит
            tx.data = '0xd2f8467f';

            //Подписываем транзакцию
            tx.sign(botprivateKey); 
            //'0x' + tx.serialize().toString('hex')
            //Посылаем пустую транзакцию
            web3.eth.sendRawTransaction('0x' + tx.serialize().toString('hex'), function(err, hash){
              if (!err) {
                console.log(hash);
                txt = 'Запущена процедура возврата средств...\n';
                txt += 'https://etherscan.io/tx/' + hash + '\n';
                bot.sendMessage(chatid, txt);
              } 
              else {
                console.log(err);
                txt = 'Ошибка отправки транзакции на возврат средств: ' + err + '\n';
                bot.sendMessage(chatid, txt);
              }
            });

          }
          else {
              txt = 'Срок окончания складчины ещё не подошлёл. Вовзрат средств возможен только после: ' 
                      + a.toISOString().replace(/T/, ' ').replace(/\..+/, '');
              bot.sendMessage(chatid, txt);
          }
        }        
        else if (status == 'DONE1'){
          txt += 'Складчина уже успешно завершена, средства были отправлены держателю\n';
        }        
        else if (status == 'DONE2'){
          txt += 'Складчина уже просрочена, средства были возвращены участникам\n';
          bot.sendMessage(chatid, txt);
        }
        else {
          txt += 'Пока нечего возвращать\n';
          bot.sendMessage(chatid, txt);
        }
      }  
  });
}


//Общий вход для всех коллбэков
bot.on('callback_query', function onCallBack(msg) {
  //console.log('Call Back: ', msg);
  
  var data = String(msg.data);
  if (msg.data == 'RegYes' || msg.data == 'RegNo'){
    //Регистрируем участника в складчине
    //Проверяем есть ли уже такой участник
    connection.query('SELECT ID FROM CHATS_MEM WHERE CHATID =' + connection.escape(msg.message.chat.id) + ' AND USERID =' + connection.escape(msg.from.id) + ' LIMIT 1', 
      function(error, results, fields) {
        if (error) throw error;
        var sTxt = msg.message.text + '\n';
        if (!results.length) {
          //console.log('Creating new record about chat member');
          connection.query('INSERT INTO CHATS_MEM SET ?', {
                            CHATID:       msg.message.chat.id,
                            USERID:       msg.from.id,
                            USERFSTNAME:  String(msg.from.first_name),
                            USERLSTNAME:  String(msg.from.last_name),
                            USERNAME:     String(msg.from.username),
                            STATUS:       String(msg.data)
                          }, 
                function (error, results, fields) {
                  if (error) throw error;
                  //console.log(results.insertId);
          });
        }
        else {
          console.log('Update new record about chat member');
          connection.query('UPDATE CHATS_MEM SET ? WHERE CHATID =' + connection.escape(msg.message.chat.id) + ' AND USERID =' + connection.escape(msg.from.id), {
                            USERFSTNAME:  String(msg.from.first_name),
                            USERLSTNAME:  String(msg.from.last_name),
                            USERNAME:     String(msg.from.username),
                            STATUS:       String(msg.data)
                          }, 
                function (error, results, fields) {
                  if (error) throw error;
                  //console.log(results.insertId);
          });
        }
      
        
        sTxt = sTxt + 'Пользователь ' + msg.from.first_name + ' ' + msg.from.last_name + ' сказал: ' + ((msg.data == 'RegYes') ? 'Да' : 'Нет') + '\n';

        bot.editMessageText(sTxt, {chat_id: msg.message.chat.id, 
                                message_id: msg.message.message_id,             
                                reply_markup: JSON.stringify({
                                  inline_keyboard: [
                                    [{ text: 'Да', callback_data: 'RegYes'},{ text: 'Нет', callback_data: 'RegNo' }]
                                  ]
                                })
        });
      }
    );
  }
  else if (data[0] == 'U'){
    //Голосовалка за держателя
    //Проверяем проголосовал ли участник и можно ли ему было
    connection.query('SELECT ID FROM CHATS_MEM WHERE CHATID =' + connection.escape(msg.message.chat.id) + ' AND USERID =' + connection.escape(msg.from.id) + ' AND STATUS = \'RegYes\' AND VOTED = \'N\' LIMIT 1', 
      function(error, results, fields) {
        if (error) throw error;
        
        var sTxt = msg.message.text + '\n';
        if (!results.length) {
          //Пользователь не имеет права голосовать
          sTxt = sTxt + msg.from.first_name + ' ' + msg.from.last_name + ' уже не имеет права голоса!' + '\n';
          editBenefitMsg(msg.message.chat.id, msg.message.message_id, sTxt);
        }
        else {
          //Добавляем голос в к участнику
          connection.query('UPDATE CHATS_MEM SET VOTE = VOTE + 1 WHERE CHATID =' + connection.escape(msg.message.chat.id) + ' AND USERID =' + connection.escape(data.substring(1)), 
            function (error, results, fields) {
              if (error) throw error;
              //Установка флага о том, что участник проголосовал
              connection.query('UPDATE CHATS_MEM SET VOTED = \'Y\' WHERE CHATID =' + connection.escape(msg.message.chat.id) + ' AND USERID =' + connection.escape(msg.from.id), 
                function (error, results, fields) {
                if (error) throw error;
                //Получаем имя за кого проголосовал
                connection.query('SELECT USERID, USERFSTNAME, USERLSTNAME FROM CHATS_MEM WHERE CHATID = ' + connection.escape(msg.message.chat.id) + ' AND USERID =' + connection.escape(data.substring(1)), 
                  function (error, results, fields) {
                    if (error) throw error;
                    sTxt = sTxt + msg.from.first_name + ' ' + msg.from.last_name + ' проголосовал за: ' + String(results[0].USERFSTNAME) + ' ' + String(results[0].USERLSTNAME)  + '\n';
                    editBenefitMsg(msg.message.chat.id, msg.message.message_id, sTxt);
                  });
                });
            });
        }
      
        });
      }
});





  /*
  // contract.allEvents( {fromBlock: startblock, toBlock: 'latest'}, function(error, result){
  contract.allEvents( {fromBlock: 0, toBlock: 'latest'}, function(error, result){
    if (!error) {
      //console.log(result);
      var sum = parseFloat(web3.fromWei(result.args._value.toString(10), 'ether'));
      if (addr == result.args._from && sum == botgas){
        bot.sendMessage(chatid, 'Пришла транзакция на ' + sum + ' ETH, я заправлен. Начинаю создавать контракт на складчину в Эфире');
        contract.stopWatching();
      }
      else if (addr == result.args._from && sum > botgas) {
        bot.sendMessage(chatid, 'Пришла транзакция на ' + sum + ' ETH, я заправлен. Зачем платить больше чем надо?!. Начинаю создавать контракт на складчину в Эфире');
      }
      else {
        //bot.sendMessage(chatid, 'Не вижу бензина');
      }
      return;
      console.log(result.args._from);
      console.log(web3.fromWei(result.args._value.toString(10), 'ether') + ' ETH');
    }
  });
  */
/*
bot.on('message', function onMessage(msg) {
  console.log('Msg: ', msg);
  var opts = '';
  
  if (msg.text == '/e') {
    var keyboard = [
      ['7', '8', '9'],
      ['4', '5', '6'],
      ['1', '2', '3'],
           ['0']
    ];
  
    console.log(keyboard);
    
    opts = {
      reply_to_message_id: msg.message_id,
      reply_markup: JSON.stringify({
        keyboard: keyboard, 
        resize_keyboard: true, 
        one_time_keyboard: true
      })
    };
    
    console.log(opts);
    
    bot.sendMessage(msg.chat.id, 'Calc?', opts);
  }
  else if (msg.text == '/f') {
    opts = {
      reply_to_message_id: msg.message_id,
        reply_markup: JSON.stringify({
          keyboard: [
            ['Yes'],
            ['No']
          ]
        })
      };
    
    console.log (opts);
    
    bot.sendMessage(msg.chat.id, 'Оно?', opts);
  }
  else {
    opts = {
      caption: 'I\'m bot!',
      keyboard: []
    };
    
    if (msg.text  === 'Yes') {
        bot.sendMessage(msg.chat.id, 'I\'m too love you!', opts);
    }
 
    if (msg.text  === 'No') {
        bot.sendMessage(msg.chat.id, ':(', opts);
    }
    
    connection.query('SELECT * from CHATS LIMIT 2', function(err, rows, fields) {
      connection.end();
      if (!err)
        console.log('The solution is: ', rows);
      else
        console.log('Error while performing Query.');
    });
    
    bot.sendMessage(msg.chat.id, 'otvet', opts);
  }
})
*/
