var config = {};

//Параметры приложения
config.app = {};

config.app.telegram_token = '348777587:AAFf-wx4GtueASIQM96CM7vawacX0JrBj0g';
config.app.telegram_url = 'https://' + process.env.C9_HOSTNAME;
config.app.port = 8080; //Внутренний порт приложения

module.exports = config;