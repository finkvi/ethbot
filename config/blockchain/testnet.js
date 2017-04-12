var config = {};

//Адрес ноды
config.nodeurl = 'https://eth.j2u.ru:8081';

//Это адрес буфферного контракта на бензин, заполняется после деплоя
config.botaddr = '0x5031bd3cab08a6fbe481009903a6fd4a758a0210';

//Сколько собираем на бензин в эфире
config.botgas = 0.05;

//Это адрес основного счёта бота, здесь будут копиться все деньги
config.botbackaddr = '0xd304421e38b8A3b10a917A4E38AA3a65d51823F6';

//Его надо хранить в безопасности, но пока так!!!!!!!!!!!!!!!!
config.botprivateKey = '829a3198a2786268bc0c364b9075043585d8870a74617890aadce6b27106c070';

module.exports = config;