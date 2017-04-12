var config = {};

//Параметры приложения
config.app = {};

config.app.telegram_token = '341223987:AAGfy14GlBRSzGVogH4udHq9T8EHCWmHWYI';
config.app.telegram_url = 'https://' + process.env.C9_HOSTNAME;
config.app.port = 8080; //Внутренний порт приложения

module.exports = config;