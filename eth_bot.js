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

const conf = require('./conf');
const botconf = conf.bot[botenv];
const blockchainconf = conf.blockchain[blockchainenv];
////////////////////////CONFIG SECTION////////////////////////////////

const botwait = botconf.botwait;
const botaddrwait = botconf.botaddrwait;
const botaddr = blockchainconf.botaddr;
const botgas = blockchainconf.botgas;
const botbackaddr = blockchainconf.botbackaddr;
const botprivateKey = new Buffer(blockchainconf.botprivateKey, 'hex');

//Скомпилированный контракт буферного договора на бензин
const botabi = conf.blockchain.botabi;
const botcode = conf.blockchain.botcode;
//Скомпилированный контракт складчины без параметров
const skladabi = conf.blockchain.skladabi;
const skladcode = conf.blockchain.skladcode;

var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(blockchainconf.nodeurl));

var mysql = require('mysql');
var connection = mysql.createConnection(conf.DB);

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
bot.setWebHook(`${url}/bot${TOKEN}`).then(
  function(){
    console.info('WebHook created');  
    console.info('Connecting to Database...');
    connection.connect(function(err){
      if(!err) {
          console.info('Database is connected');
          console.info('Test connection to Ethereum Node. Trying to check Bot balance...');
          try {
            var balance = web3.eth.getBalance(botbackaddr);
            console.info('Connection good. Bot balance is %s', balance);
            
            console.info('Starting Telegram Bot...');
            
            bot.getMe().then(function(me)
            {
                console.info('Bot name is %s', me.first_name);
                console.info('Bot id is %s.', me.id);
                console.info('And Bot username is @%s', me.username);
                console.info('We Hook URL on %s', url);
                console.info('Ethereum Node is %s', blockchainconf.nodeurl);
                console.info('Bot address for saving ETH is %s', botbackaddr);
                console.info('Bot contract address for benz is %s', botaddr);
                startBot();
                console.info('Bot started. Waiting commands from users');
            });
          } catch(e) {
            console.error("Error connecting to Ethereum Node");
            console.error(e);
            //Падаем
            process.exit(1);
          }
      } else {
        console.error("Error connecting database");    
        console.error(err);
        //Падаем
        process.exit(1);
      }
    });
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

function startBot() {

  bot.onText(/\/start/, function onStartReg(msg) {
     console.log('Chat %s. Received command /start', msg.chat.id);
    //Проверяем есть ли уже запись о регистрации складчины в базе для этого чата
    connection.query('SELECT * FROM CHATS WHERE CHATID = ' + connection.escape(msg.chat.id) + ' LIMIT 1', function(err, rows, fields) {
        if (err) throw err;
        if (!rows.length) {
          console.info('Creating new record about chat %s', msg.chat.id);
          connection.query('INSERT INTO CHATS SET ?', {
                            CHATID: msg.chat.id,
                            TITLE:  String(msg.chat.title)
                            }, 
          function (error, results, fields) {
            if (error) throw error;
            console.log('Chat record inserted to CHATS table with Id=%s', results.insertId);
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
              console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
              console.log ('Chat %s. Waiting registration for %s...', regmsg.chat.id, botwait);
              setTimeout(function() {
                console.log ('Chat %s. Registration stop finished', regmsg.chat.id);
                bot.editMessageReplyMarkup(JSON.stringify({inline_keyboard: []}), 
                                        {chat_id: regmsg.chat.id, 
                                        message_id: regmsg.message_id,             
                }).then(function(regmsg){
                  console.log ('Chat %s. Edit message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
                  connection.query("SELECT USERNAME, USERFSTNAME, USERLSTNAME FROM CHATS_MEM WHERE CHATID = " + connection.escape(regmsg.chat.id) + " AND STATUS = \'RegYes\'", 
                  function (err, rows, fields) {
                    if (err) throw err;
                    if (rows.length) {
                      var sReg = '';
                      for (var i = 0; i < rows.length; i++) {
                        sReg = sReg + rows[i].USERFSTNAME + ' ' + rows[i].USERLSTNAME + ' (@' + rows[i].USERNAME + ')\n';
                      }
                      sReg = 'Итого зарегистрировались: \n' + sReg + 'Только эти участники смогут скидываться';
                      
                      bot.sendMessage(msg.chat.id, sReg).then(function(regmsg) {
                        console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));  
                        //Поехали выбирать держателя складчины
                        setBenefit(regmsg.chat.id);
                      });
                    }
                    else {
                      connection.query('DELETE FROM CHATS WHERE CHATID =' + connection.escape(regmsg.chat.id), 
                      function(err, rows, fields) {
                        if (err) throw err;
                        bot.sendMessage(msg.chat.id, 'Никто не зарегистрировался, запустите меня заново /start').then(function(regmsg){
                          console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));  
                        });   
                      });
                    }
                  });
                });
              }, botwait);
            }); 
          }); 
        }
        else
          bot.sendMessage(msg.chat.id, 'Для этого чата уже есть запись о регистрации складчины.\nИспользуйте новый чат или продолжайте процесс в этом').then(function(regmsg) {
            console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));  
          });
      });
  });
  
  bot.onText(/\/waitbenz/, function (msg) {
    console.log('Chat %s. Received command /waitbenz', msg.chat.id);
    connection.query("SELECT BENEFIT_ADDRESS FROM CHATS WHERE CHATID = " + connection.escape(msg.chat.id) + " AND STATUS = \'CONFIRM\' LIMIT 1", 
      function (err, rows, fields) {
        if (err) throw err;
        if (rows.length) {
            checkGasForMe(msg.chat.id, rows[0].BENEFIT_ADDRESS);
        }
    });
  });
  
  bot.onText(/\/deploy/, function (msg) {
    console.log('Chat %s. Received command /deploy', msg.chat.id);
    connection.query("SELECT ID FROM CHATS WHERE CHATID = " + connection.escape(msg.chat.id) + " AND STATUS = \'PAID\' LIMIT 1", 
      function (err, rows, fields) {
        if (err) throw err;
        if (rows.length) {
            deployContract(msg.chat.id);
        }
    });
  });
  
  bot.onText(/\/waittrans/, function (msg) {
    console.log('Chat %s. Received command /waittrans', msg.chat.id);
    connection.query("SELECT CONTRACT_ADDRESS, STARTBLOCK FROM CHATS WHERE CHATID = " + connection.escape(msg.chat.id) + " AND STATUS = \'MINED\' LIMIT 1", 
      function (err, rows, fields) {
        if (err) throw err;
        if (rows.length) {
            waitTransactions(msg.chat.id, rows[0].STARTBLOCK, rows[0].CONTRACT_ADDRESS);
        }
    });
  });
  
  bot.onText(/\/status/, function (msg) {
    console.log('Chat %s. Received command /status', msg.chat.id);
    skladstatus(msg.chat.id);
  });
  
  bot.onText(/\/vozvr/, function (msg) {
    console.log('Chat %s. Received command /vozvr', msg.chat.id);
    skladvozvr(msg.chat.id);
  });

  //Общий вход для всех коллбэков
  bot.on('callback_query', function onCallBack(msg) {
    var data = String(msg.data);
    console.log('Chat %s. Received callback_query with data %s', msg.message.chat.id, data.replace(/\r?\n|\r/g, ''));
    
    if (msg.data == 'RegYes' || msg.data == 'RegNo'){
      //Регистрируем участника в складчине
      //Проверяем есть ли уже такой участник
      connection.query('SELECT ID FROM CHATS_MEM WHERE CHATID =' + connection.escape(msg.message.chat.id) + ' AND USERID =' + connection.escape(msg.from.id) + ' LIMIT 1', 
        function(error, results, fields) {
          if (error) throw error;
          var sTxt = msg.message.text + '\n';
          if (!results.length) {
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
                    console.log('Created new record about chat member %s with Id=%s', msg.from.username, results.insertId);
            });
          }
          else {
            connection.query('UPDATE CHATS_MEM SET ? WHERE CHATID =' + connection.escape(msg.message.chat.id) + ' AND USERID =' + connection.escape(msg.from.id), {
                              USERFSTNAME:  String(msg.from.first_name),
                              USERLSTNAME:  String(msg.from.last_name),
                              USERNAME:     String(msg.from.username),
                              STATUS:       String(msg.data)
                            }, 
                  function (error, results, fields) {
                    if (error) throw error;
                    console.log('Updated record about chat member %s with Id=%s', msg.from.username, results.insertId);
            });
          }
        
          
          sTxt = sTxt + 'Пользователь ' + msg.from.first_name + ' ' + msg.from.last_name + '(@' +  msg.from.username + ') сказал: ' + ((msg.data == 'RegYes') ? 'Да' : 'Нет') + '\n';
  
          bot.editMessageText(sTxt, {chat_id: msg.message.chat.id, 
                                  message_id: msg.message.message_id,             
                                  reply_markup: JSON.stringify({
                                    inline_keyboard: [
                                      [{ text: 'Да', callback_data: 'RegYes'},{ text: 'Нет', callback_data: 'RegNo' }]
                                    ]
                                  })
          }).then(function(regmsg){
            console.log ('Chat %s. Endit message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
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
            sTxt = sTxt + msg.from.first_name + ' ' + msg.from.last_name + '(@' +  msg.from.username + ') не может голосовать!' + '\n';
            editBenefitMsg(msg.message.chat.id, msg.message.message_id, sTxt, false);
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
                      editBenefitMsg(msg.message.chat.id, msg.message.message_id, sTxt, true);
                    });
                  });
              });
          }
          });
        }
  });
}

//Выбор держателя складчины
function setBenefit(chatid){
  connection.query("SELECT USERID, USERFSTNAME, USERLSTNAME FROM CHATS_MEM WHERE CHATID = " + connection.escape(chatid) + " AND STATUS = \'RegYes\'", 
  function (err, rows, fields) {
    if (err) throw err;
    if (rows.length) {
      var kb = [
      ];
      for (var i=0; i < rows.length; i++) {
        kb.push([{text: rows[i].USERFSTNAME + ' ' + rows[i].USERLSTNAME, callback_data: 'U' + rows[i].USERID}]);
      }
      var options = {
                  reply_markup: JSON.stringify({
                    inline_keyboard: kb
                  })
                };  
      bot.sendMessage(chatid, 'Теперь выберите держателя складчины', options).then(function (regmsg) {
        console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
      });
    }
  });
}

//Редактирование сообщения о выборе держателя складчины
function editBenefitMsg(chatid, msgid, txt, needcheck){
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
      }).then(function(regmsg){
        if (needcheck) checkBenefit(regmsg);
      });
  });
}

//Проверка, что все проголосовали за держателя и переход дальше
function checkBenefit(regmsg){
  //Проверяем, что все проголосовали
  connection.query("SELECT USERID FROM CHATS_MEM WHERE CHATID = " + connection.escape(regmsg.chat.id) + " AND STATUS = \'RegYes\' AND VOTED = \'N\' LIMIT 1", 
  function (err, rows, fields) {
    if (err) throw err;
    if (!rows.length) {
      //Убираем клавиши
      bot.editMessageReplyMarkup( JSON.stringify({inline_keyboard: []}), 
                        {chat_id: regmsg.chat.id, 
                        message_id: regmsg.message_id,             
      }).then(function(regmsg){
        console.log ('Chat %s. Edit message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
        //Объявляем победителя
        connection.query("SELECT USERID, USERNAME, USERFSTNAME, USERLSTNAME FROM CHATS_MEM WHERE CHATID = " + connection.escape(regmsg.chat.id) + " ORDER BY VOTE DESC LIMIT 1", 
          function (err, rows, fields) {
            if (err) throw err;
            if (rows.length) {
              var sName = rows[0].USERFSTNAME + ' ' + rows[0].USERLSTNAME;
              var iUserId = rows[0].USERID;
              var sLogin = rows[0].USERNAME;
              connection.query('UPDATE CHATS SET BEN_USER = ' + rows[0].USERID + ' WHERE CHATID = ' + connection.escape(regmsg.chat.id), 
                function (err, rows, fields) {
                  if (err) throw err;
                    bot.sendMessage(regmsg.chat.id, 'Держателем складчины выбран: ' + sName).then (function (regmsg) {
                      console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
                      //Опрашиваем держателя о сумме и сроке
                      setGoal (regmsg.chat.id, iUserId, sName, sLogin);
                    });
                });
            }
        });
      });
    }
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
          console.log ('Chat %s. Send message %s', goal.chat.id, goal.text.replace(/\r?\n|\r/g, ''));
          console.log ('Chat %s. Waiting replay from %s goal', goal.chat.id, login);
          bot.onReplyToMessage(chatid, goal.message_id, function repGoal (goalmsg) {
            console.log ('Chat %s. Received replay %s', goalmsg.chat.id, goalmsg.text);
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
                        setDeadline(chatid, userid, userfullname, login, goal);
                      });
                  }
                  else {
                    bot.sendMessage(chatid, 'На данной стадии редактрование цели уже невозможно').then(function(regmsg) {
                      console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
                    });
                  }
                });
              }
              
              else {
                bot.sendMessage(chatid, 'Кривые руки? А ещё держатель... Присылай ответом на сообщение корректную цифру', {reply_to_message_id: goalmsg.message_id}).then(function(regmsg){
                  console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
                });
              }
            }
            else {
              bot.sendMessage(chatid, 'Уважаемый, не пытайся меня наебать, ты не деражатель складчины!', {reply_to_message_id: goalmsg.message_id}).then(function(regmsg) {
                console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
              });
            }
          });
      });
    });
  }
  else {
    bot.sendMessage(chatid, 'Уважаемый, ' + userfullname + '! Заполни свой username, чтобы я смог к тебе обращаться. Затем ответь на сообщение снова').then (function (regmsg){
      //Может допишем ожидалку
      console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
    }); 
  }
}

//Опрос держателя о сроке складчины
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
      function (regmsg) {
        console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
        console.log ('Chat %s. Waiting replay from %s deadline', regmsg.chat.id, login);
        bot.onReplyToMessage(chatid, regmsg.message_id, function repTime (timemsg) {
          console.log ('Chat %s. Received replay %s', timemsg.chat.id, timemsg.text);
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
                      getMemAddr(chatid, userid, userfullname, login, goal, interval);
                    });
                }
                else {
                  bot.sendMessage(chatid, 'На данной стадии редактрование срока уже невозможно').then(function(regmsg) {
                    console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
                  });
                }
              });
            }
            else {
              bot.sendMessage(chatid, 'Кривые руки? А ещё держатель... Присылай ответом на сообщение корректное время', {reply_to_message_id: timemsg.message_id}).then(function(regmsg) {
                  console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
              });
            }
          }
          else {
            bot.sendMessage(chatid, 'Уважаемый, не пытайся меня наебать, ты не деражатель складчины!', {reply_to_message_id: timemsg.message_id}).then(function(regmsg) {
              console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, '')); 
            });
          }
        });
    });
  }
  else {
    bot.sendMessage(chatid, 'Уважаемый, ' + userfullname + '! Заполни свой username, чтобы я смог к тебе обращаться').then (function (regmsg){
      //Может допишем ожидалку
      console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
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
  
  bot.sendMessage(chatid, txt).then(function (regmsg) {
    console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
    var opts = {
    reply_markup: JSON.stringify({
        force_reply: true
      }
    )};
    
    var alladr = false;
    
    bot.sendMessage(chatid, 'Укажите адрес кошелька', opts).then(function(regmsg) {
      console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
      console.log ('Chat %s. Waiting replay from ALL about ETH addresses', regmsg.chat.id);
      bot.onReplyToMessage(chatid, regmsg.message_id, function (addrmsg) {
        console.log ('Chat %s. Received replay %s', addrmsg.chat.id, addrmsg.text);
        if (web3.isAddress(addrmsg.text)) {
          connection.query("UPDATE CHATS_MEM SET `STATUS` = \'CONFIRM\', `USER_ADDRESS` = \'" + addrmsg.text + "\' WHERE STATUS = \'RegYes\' AND CHATID = " + connection.escape(chatid) + " AND USERID = " + connection.escape(addrmsg.from.id), 
          function (err, rows, fields) {
            if (err) throw err;
            console.log('Chat %s. Added ETH address for user: %s', addrmsg.chat.id, addrmsg.from.username);
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
                  console.log('Chat %s. ALL user send ETH addresses', addrmsg.chat.id);
                  
                  getGasFromBen(chatid, userid, userfullname, login, goal, interval);
                });                                    
              }
              else {
                console.log('Chat %s. Waiting other users', addrmsg.chat.id);
                //console.log('Ждём адресов!');
              }
            });
          });
        }
        else {
          bot.sendMessage(chatid, 'Это НЕ адрес кошелька, укажи корректный адрес',  {reply_to_message_id: addrmsg.message_id}).then(function(regmsg) {
              console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
          });
        }
      });
      // //Здесь вводим ограничение по сроку отправки адресов, допишем позже
      // setTimeout(function() {
      //   if (!alladr) {
      //     console.log('Время на сбор адресов вышло, переходим далее принудительно');
      //     //getGasFromBen(chatid, userid, userfullname, login, goal, interval);
      //   }
      // }, botaddrwait);
      
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
                  bot.sendMessage(chatid, txt).then(function(regmsg) {
                    console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
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
          bot.sendMessage(chatid, 'Некорректные данные. Нет присланных адресов. Создайте новый чат').then(function(regmsg) {
              console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
          });
        }
      });
}

function checkGasForMe(chatid, addr) {
  var startblock = web3.eth.blockNumber;
  var contract = web3.eth.contract(botabi).at(botaddr);
  var myEvent = contract.DepositMade({}, {fromBlock: startblock, toBlock: 'latest'});
  console.log ('Chat %s. Create event. Wating for benz...', chatid);
  myEvent.watch(function(error, result){
    if (!error) {
      var sum = web3.fromWei(result.args._value.toString(10), 'ether');
      var chatidhash = (web3.sha3(web3.toHex(chatid)));
      if (addr.toLowerCase() == result.args._from.toLowerCase() && result.args._chatid.toLowerCase() == chatidhash.toLowerCase()){
        console.log ('Chat %s. Done - benz catched. ChatHash: %s; From address: %s ', chatid, result.args._chatid.toLowerCase(), addr.toLowerCase());
        //Обновляем статус чата в базе
        connection.query("UPDATE CHATS SET STATUS = \'PAID\' WHERE CHATID = " + connection.escape(chatid), 
            function (err, rows, fields) {
              if (err) throw err;
              bot.sendMessage(chatid, 'Пришла транзакция на ' + sum + ' ETH, я заправлен. Начинаю создавать контракт на складчину в Эфире').then(function (regmsg) {
                console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
                myEvent.stopWatching();
                deployContract (chatid);
              });
            }
        );
      }
      else {
        console.log ('Chat %s. Other transactions. ChatHash: %s; From address: %s ', chatid, result.args._chatid.toLowerCase(), addr.toLowerCase());
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
        tx.gasPrice = web3.toHex(web3.eth.gasPrice);
        tx.value = '0x00';
        tx.data = data;
        
        //Вычисляем лимит газа на транзакцию, мы готовы потратить половину от того, что на сколько нас заправляют
        var gasLimit = Math.ceil((web3.toWei(botgas, 'ether') / 2) / web3.eth.gasPrice);
        tx.gasLimit =  web3.toHex(gasLimit);

        //Подписываем транзакцию
        tx.sign(botprivateKey); 
        
        //Проверяем
        var v = tx.validate();
        if (!v) {
          console.log ('Chat %s. Transaction created error: %s ', chatid, v);
        }
        else {
          //Отправляем
          console.log ('Chat %s. Sending transaction for create contract with Gas Limit %s', chatid, gasLimit);
          web3.eth.sendRawTransaction('0x' + tx.serialize().toString('hex'), function(err, hash) {
            var txt = '';
            if (!err) {
              txt = 'Транзакция на создание контракта отправлена успешно\n';
              txt += 'Хэш транзакции: ' + hash + '\n';
              txt += 'Дополнительную информацию о статусе транзакции можно посмотреть здесь \n';
              txt += 'https://etherscan.io/tx/' + hash + '\n';
              txt += 'Я жду майнинга транзакции контракта скалдчины...';
              
              bot.sendMessage(chatid, txt).then(function(regmsg){
                console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
                waitContract(chatid, hash, gasLimit);
              });
            }
            else {
              txt = 'Ошибка отправки транзакции на создание контракта: ' + err + '\n';
              txt += 'Попробуйте выполнить команду /deploy, чтобы повторить отправку';
              bot.sendMessage(chatid, txt).then(function(regmsg) {
                console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
              });
            }
        });
        }
      });
    }
  });
}

function waitContract(chatid, hash, gasLimit) {
  console.log ('Chat %s. Waiting for contract creation. Transaction hash: %s', chatid, hash);
  var  filter = web3.eth.filter('latest');
  filter.watch(function(error, result) {
    if (!error){
      var receipt = web3.eth.getTransactionReceipt(hash);
      if (receipt && receipt.transactionHash == hash) {
        if (receipt.gasUsed.toString(10) < gasLimit) {
          console.log ('Chat %s. Contract created. Address: %s', chatid, receipt.contractAddress);
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
              bot.sendMessage(chatid, txt).then(function (regmsg) {
                console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
                waitTransactions(chatid, startblock, receipt.contractAddress);
              });
          });
        }
        else {
          filter.stopWatching();
          var txt = 'Ошибка отправки транзакции на создание контракта: у бота кончился бензин:)\n';
          txt += 'Попробуйте заправить бота снова и выполнить команду /deploy, чтобы повторить отправку';
          bot.sendMessage(chatid, txt).then(function(regmsg) {
              console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
          });
        }
      }  
    }
  });
}

//Ждём транзакций
function waitTransactions (chatid, startblock, conaddr){
  console.log ('Chat %s. Waiting for transactions to contract: %s', chatid, conaddr);
  
  var contract = web3.eth.contract(skladabi).at(conaddr);
  
  //Новые деньги
  var NewMoney = contract.NewMoney({}, {fromBlock: startblock, toBlock: 'latest'});
  NewMoney.watch(function(error, result){
    if (!error) {
      var sum = web3.fromWei(result.args._value.toString(10), 'ether');
      var from = result.args._from;
      bot.sendMessage(chatid, 'Пришла транзакция на ' + sum + ' ETH с адреса ' + from).then(function(regmsg) {
          console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
      });
    }
    else {
        //При ошибке убиваем фильтр
        NewMoney.stopWatching();
        console.error(error);
      }    
  });
  
  //Раздача денег
  var SendMoney = contract.SendMoney({}, {fromBlock: startblock, toBlock: 'latest'});
  SendMoney.watch(function(error, result){
    if (!error) {
      var sum = web3.fromWei(result.args._value.toString(10), 'ether');
      var from = result.args._from;
      bot.sendMessage(chatid, 'Отправил ' + sum + ' ETH на адрес ' + from).then(function(regmsg) {
          console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
      });
    }
    else {
        SendMoney.stopWatching();
        console.error(error);
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
      
      bot.sendMessage(chatid, txt).then(function(regmsg){
        console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
        
        NewMoney.stopWatching();
        SendMoney.stopWatching();
        ChangeStatus.stopWatching();
        
        //Валим
        connection.query("UPDATE CHATS SET STATUS = \'DONE" +  status + "\' WHERE CHATID = " + connection.escape(chatid), 
          function (err, rows, fields) {
            if (err) throw err;
            txt = 'Я закончил свою работу. До новых встреч! \n';
            txt+= 'Написать разработчику можно сюда vfink@tsconsulting.ru';
            bot.sendMessage(chatid, txt).then(function(regmsg) {
              console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
            });
          });
      });
    }
    else {
        ChangeStatus.stopWatching();
        console.error(error);
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
          bot.sendMessage(chatid, txt).then(function(regmsg) {
              console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
          });
        }        
        else if (status == 'SET'){
          txt += 'Установлены параметры складчины';
          bot.sendMessage(chatid, txt).then(function(regmsg) {
              console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
          });
        }        
        else if (status == 'CONFIRM'){
          txt += 'Складчина подтверждена сбором адресов кошельков';
          bot.sendMessage(chatid, txt).then(function(regmsg) {
              console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
          });
        }       
        else if (status == 'PAID'){
          txt += 'Складчина получила средства на бензин и ожидает создание контракта в Эфире';
          bot.sendMessage(chatid, txt).then(function(regmsg) {
              console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
          });
        }   
        else if (status == 'MINED'){
          txt += 'Складчина создана в Эфире\n';
          getConSklad(chatid, conaddr, function (state) {
            txt+=state;
            bot.sendMessage(chatid, txt).then(function(regmsg) {
                console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
            });
          });
        }        
        else if (status == 'DONE1'){
          txt += 'Складчина успешно завершена, средства отправлены держателю\n';
          getConSklad(chatid, conaddr, function (state) {
            txt+=state;
            bot.sendMessage(chatid, txt).then(function(regmsg) {
                console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
            });
          });
        }        
        else if (status == 'DONE2'){
          txt += 'Складчина просрочена, средства возвращены участникам\n';
          getConSklad(chatid, conaddr, function (state) {
            txt+=state;
            bot.sendMessage(chatid, txt).then(function(regmsg) {
                console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
            });
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
  
  state += 'Все должны скинуться по: ' + Math.ceil(100000*summa_sklad/memscount)/100000 + ' ETH';
  
  if (typeof (cb) == 'function') cb(state);
  
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
            
            //Вычисляем лимит газа на транзакцию, мы готовы потратить половину от того, что на сколько нас заправляют
            var gasLimit = Math.ceil((web3.toWei(botgas, 'ether') / 2) / web3.eth.gasPrice);
            
            tx.gasLimit = web3.toHex(gasLimit);
            tx.value = 0;
            tx.to = web3.toHex(conaddr);
            //Вот тут походу вызов функции vozvrat сидит
            tx.data = '0xd2f8467f';

            //Подписываем транзакцию
            tx.sign(botprivateKey); 
            
            //Посылаем пустую транзакцию
            web3.eth.sendRawTransaction('0x' + tx.serialize().toString('hex'), function(err, hash){
              if (!err) {
                console.log(hash);
                txt = 'Запущена процедура возврата средств...\n';
                txt += 'Детали транзакции здесь https://etherscan.io/tx/' + hash + '\n';
                bot.sendMessage(chatid, txt).then(function(regmsg) {
                    console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
                });
              } 
              else {
                console.log(err);
                txt = 'Ошибка отправки транзакции на возврат средств: ' + err + '\n';
                bot.sendMessage(chatid, txt).then(function(regmsg) {
                    console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
                });
              }
            });

          }
          else {
              txt = 'Срок окончания складчины ещё не подошлёл. Вовзрат средств возможен только после: ' 
                      + a.toISOString().replace(/T/, ' ').replace(/\..+/, '') + '\n';
              txt += 'Текущее время: ' + d.toISOString().replace(/T/, ' ').replace(/\..+/, '') + '\n';
              bot.sendMessage(chatid, txt).then(function(regmsg) {
                  console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
              });
          }
        }        
        else if (status == 'DONE1'){
          txt += 'Складчина уже успешно завершена, средства были отправлены держателю\n';
          bot.sendMessage(chatid, txt).then(function(regmsg) {
              console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
          });
        }        
        else if (status == 'DONE2'){
          txt += 'Складчина уже просрочена, средства были возвращены участникам\n';
          bot.sendMessage(chatid, txt).then(function(regmsg) {
              console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
          });
        }
        else {
          txt += 'Пока нечего возвращать\n';
          bot.sendMessage(chatid, txt).then(function(regmsg) {
              console.log ('Chat %s. Send message %s', regmsg.chat.id, regmsg.text.replace(/\r?\n|\r/g, ''));
          });
        }
      }  
  });
}
