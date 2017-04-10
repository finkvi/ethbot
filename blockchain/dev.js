var config = {};

//Адрес ноды
config.nodeurl = 'https://ethbot-finkvi.c9users.io:8081';

//Это адрес буфферного контракта на бензин, заполняется после деплоя
config.botaddr = '0xb2e62958a5cde204498c6377c7da0ba99eb4bc77';

//Сколько собираем на бензин в эфире
config.botgas = 0.05;

//Это адрес основного счёта бота, здесь будут копиться все деньги
config.botbackaddr = '0xD931856721149Ed5120BfDfde9A222Cfcbe857Fe';

//Его надо хранить в безопасности, но пока так!!!!!!!!!!!!!!!!
config.botprivateKey = '93e74a44550665661230a343436ec575c5754a5b0e803c74da67b1fcb4992200';

module.exports = config;