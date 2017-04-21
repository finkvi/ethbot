## Telegram Bot + Ethereum 

Бот - договорщик по складчинам. Умная машина гарант сервиса.

## Видео для обучения и погружения в Ethereum здесь:

[Playlist](https://www.youtube.com/playlist?list=PLyFjobwzo9clU7mCg1YUhFo0_suBAojEE)

- [Ethereum Study Overview](https://youtu.be/hNPjLjyLF_I) - вводная тех. лекция. Не всё работает, проба пера
- [Ethereum Telegram Bot Presentation](https://youtu.be/2QEu-gLrwRc) - презентация бота и логика работы
- [Ethereum Chat Bot Develop Sample](https://youtu.be/tSEtLa_cmLo) - Начиная с 45 минуты непосредственно демонстрация работы
- [Ethereum Bot Install for PROD Enviroment](https://youtu.be/_TKW-jJTcvA) - Установка в ПРОД, После 1:40 первый запуск бота в реальной Ethereum сети.

## Работающие в сети боты такие:

- @EthGarant_bot - Бот, настроенный на главный блокчейн
- @EthGarantTestnet_bot - Бот, настроенный на тестнет блокчейн

Тестируем, не стесняемся, создаём реквесты

## Постановка задачи и допущения

1. Есть группа людей, которые хотят собрать деньги (скинуться) на покупку чего-либо
2. Каждый из них не доверяет другому, не доверяет и стороннему сервису (в нашем случае telegram боту)
3. Каждый готов довериться технологии blockchain, если она будет «прозрачно» использоваться сторонним сервисом. Под прозрачностью понимается возможность самостоятельной проверки каждым результатов функционирования сервиса
4. Каждый представляет на базовом уровне, что есть криптовалюта Ethereum, имеет свой кошелёк и умеет осуществлять транзакции
5. Процесс такого рода здесь и далее называется "складчиной". Это НЕ краудфайдинг, далее будут видны принципиальные отличия

## Идея реализации

- Группа людей создает групповой чат в Telegram, например, «Сбор денег на обучение»
- Любой участник добавляет в него бота @EthGarant_bot и запускает его /start
- Бот ведет диалог открыто в чате с каждым участником и организует сбор и перевод средств
- Инструментом является среда Ethereum. Бот, на основании ответов участников чата, формирует начальные требования (параметры) умного контракта. Затем публикует контракт в блокчейн Ethereum и даёт возможность непосредственно в чате просмотреть состояние контракта
- На каждом этапе любой участник чата может проверить с использованием сторонних средст (https://etherscan.io/, локального кошелька Ethereum Wallet, любых других) результат работы бота и транзакций от участников чата
- Сам бот имеет открытый исходный код. Параноики могут самостоятельно сделать его форк и запустить на своих мощностях
- Бот, конечно же, не хранит параметры доступа к кошелькам участников. Для истории бот хранит переписку чата, доступную для него, в своей базе данных

## Детали умного контракта
- Круг участников должен быть определен до первой транзакции. Это значит, что бот опросит всех по очереди и попросит сказать «Да/Нет» на вопрос об участии в складчине
- Транзакции от «незарегистрированных» участников идут в пользу бота и не учитываются в складчине
- Транзакции больше необходимой суммы учитываются как необходимая сумма, остальное идет в пользу бота
- Если хотя бы один участник не производит оплату или делает её частичной в заданное время, контракт возвращает средства всем заплатившим участникам (за исключением переплат), кроме частичных средств не выполнившего условия участника
- Так как владельцем контракта, а следовательно и его публикатором является бот, то и топливо на его публикацию списывается с кошелька бота. Это не очень хорошо, так как если участники складчины не допускают ошибок, бот остается в маленьком минусе при успешном завершении складчины и в чуть большем минусе при неуспешном (топливо на возврат транзакций). Здесь можно поступить несколькими способами, сделаем самый верный, будем брать на бензин с кошелька, на который упадет вся сумма складчины после её завершения(это один из участников, которого так же определит бот). Как только получили на бензин, начинаем исполнение контракта

## Сценарий использования

- Схема процесса [здесь](https://github.com/finkvi/ethbot/blob/master/presentation/Main%20Process.pdf)

- Пример успешного (когда складчина собрала необходимые деньги) чата можно посмотреть [здесь](https://github.com/finkvi/ethbot/blob/master/presentation/ExampleYes.pdf)

- Пример неуспешного сбора [здесь](https://github.com/finkvi/ethbot/blob/master/presentation/ExampleNo.pdf)

## Технологии
- Node JS (Telegram Bot + node-telegram-bot-api) для написания бота
- Node JS (Ethereum + web3 + ethereumjs-tx) для взаимодействия с блокчейном
- Solidity язык умных контрактов
- Среда разработки для Node JS: https://c9.io
- Среда разработки для Solidty: https://remix.ethereum.org
- Локальный кошелек: Ethereum Wallet
- Web кошелек: https://www.myetherwallet.com
- Посмотреть, что происходит в блокчейне здесь: https://etherscan.io/
- Тестовая сеть здесь: https://ropsten.etherscan.io/
- Девелопреская нода и блокчейн здесь: https://ethbot-finkvi.c9users.io:8081

# Установка (проверено на Digital Ocean):
- Создаем стандартный дроплет 2 GB Memory / 40 GB Disk / FRA1 - Ubuntu 16.04.2 x64  за 20$, заводим sudo юзера, апгрейдимся

- Добавляем swap - 4G по статье https://www.digitalocean.com/community/tutorials/how-to-add-swap-space-on-ubuntu-16-04
- Задаем домен для IP, потребуется для выпуска сертификатов, ну и просто так круче

## Установка ноды
- Устанавливаем geth (клиент блокчейна) https://github.com/ethereum/go-ethereum/wiki/Installation-Instructions-for-Ubuntu

- Запускаем синхронизацию для testnet:
```
nohup geth --testnet --fast --cache=1024 &
```
- Когда синхронизация закончится, аналогично для основной сети:
```
nohup geth --fast --cache=1024 &
```
Эта процедура занимаем длительное время, у меня окол заняло о суток. В результате имеем большую папчку chaindata
```
eth@ethnode:~/.ethereum/geth$ ll
total 272
drwxr-xr-x 4 eth eth   4096 Apr  9 11:32 ./
drwx------ 5 eth eth   4096 Apr 10 18:13 ../
-rw-r--r-- 1 eth eth      0 Apr  9 11:31 LOCK
drwxr-xr-x 2 eth eth 262144 Apr 10 18:09 chaindata/
-rw------- 1 eth eth     64 Apr  9 11:31 nodekey
drwxr-xr-x 2 eth eth   4096 Apr 10 17:49 nodes/
eth@ethnode:~/.ethereum/geth$ pwd
/home/eth/.ethereum/geth
eth@ethnode:~/.ethereum/geth$ 
```

Проверяем запуск ноды основного блокчейна, блоки должны синхронизироваться по одному:
```
geth --rpc --rpcaddr "0.0.0.0" --rpcport 8081 --rpccorsdomain "*" --rpcapi "admin,debug,miner,shh,txpool,personal,eth,net,web3" console
///
I0411 13:16:02.108152 core/blockchain.go:1070] imported    1 blocks,     2 txs (  0.068 Mg) in  15.700ms ( 4.310 Mg/s). #3516782 [3333c529…]
I0411 13:16:09.890218 core/blockchain.go:1070] imported    1 blocks,     1 txs (  0.034 Mg) in   9.181ms ( 3.656 Mg/s). #3516783 [4c0b0b04…]
```

- Устнановим nginx. Он нам потребуется для проксирования подключения к ноде и для проксирования подключения к приложению на Node JS https://www.digitalocean.com/community/tutorials/nginx-ubuntu-16-04-ru.

- Устанавливаем letsencrypt, это бесплатные подтверждённые сертификаты https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04. Они необходимы для работы с нодой по https, например, из веб кошелька, а так же трафика от серверов телеграмм, они позволяют только по https. Ну и вообще это трэнд, везде https

- Теперь настроим проксирование трафика через nginx на geth для основной сети и для testnet.
```
eth@ethnode:/etc/nginx/sites-available$ sudo nano /etc/nginx/sites-available/default

Добавляем

##For Geth Main
server {
        listen 8765 ssl;
        listen [::]:8765 ssl;
        include snippets/ssl-eth.j2u.ru.conf;
        include snippets/ssl-params.conf;

	server_name _;

        location / {
            proxy_pass         http://127.0.0.1:8565/;
            proxy_redirect     off;
            proxy_set_header   Host $host;
            proxy_set_header   X-Real-IP $remote_addr;
            proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Host $server_name;
        }
}

##For Geth Testnet
server {
        listen 8766 ssl;
        listen [::]:8766 ssl;
        include snippets/ssl-eth.j2u.ru.conf;
        include snippets/ssl-params.conf;
      
	server_name _;

        location / {
            proxy_pass         http://127.0.0.1:8566/;
            proxy_redirect     off;
            proxy_set_header   Host $host;
            proxy_set_header   X-Real-IP $remote_addr;
            proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Host $server_name;
        }
}

eth@ethnode:/etc/nginx/sites-available$ sudo nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
eth@ethnode:/etc/nginx/sites-available$ sudo systemctl restart nginx
eth@ethnode:/etc/nginx/sites-available$ 
```
- Проверяем, можем ли подключиться к ноде из вне. Запускаем
```sh
geth --testnet --rpc --rpcaddr "0.0.0.0" --rpcport 8550 --rpccorsdomain "*" --rpcapi "admin,debug,miner,shh,txpool,personal,eth,net,web3" console
```
- идём https://www.myetherwallet.com, добавляем кастомную ноду, проверяем баланс кошелька, например.
- Если всё хорошо, баланс виден, поднимаем ноды через screen

## Установка приклада. База

- Устанавливаем мускуль по статье здесь: https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-14-04

- Устанавливаем phpMyAdmin по этой статье: https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-phpmyadmin-with-nginx-on-an-ubuntu-14-04-server
Так можно будет смотреть что в базе, защитим его нормально и запустим на нестандартном порту

- Устанавливаем git и клонируем проект
```sh
git clone https://github.com/finkvi/ethbot/
```
- Импортируем структуру базы данных phpMyAdmin, файл [отсюда](https://github.com/finkvi/ethbot/blob/master/deploy/botdb.sql)

## Установка приклада. Node JS + приложение

- Ставим стабильную v6_x
```sh
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install nodejs
```

- Ставим git и вытягиваем проект
```sh
sudo apt-get install git
git clone https://github.com/finkvi/ethbot
cd ethbot/
```
- Установка зависимостей Node JS для этого проекта через npm
```sh
npm install
```
- Проверяем телеграмм
```sh
cd test/
nodejs telegram_ping.js testnet EthGarant_bot
```
Если конфиг настроен корректно, то увидим при обращении к боту
Viktor:
f
[11:40:58 PM] Ethereum Garant:
Я тебя слышу, выполни /exit, чтобы убить меня
[11:41:01 PM] Viktor:
/exit

- Проверим подключение к ноде, для этого запустим 
```
geth --testnet --rpc --rpcaddr "0.0.0.0" --rpcport 8566 --rpccorsdomain "*" --rpcapi "admin,debug,miner,shh,txpool,personal,eth,net,web3"
```
Затем 
```
eth@ethnode:~/ethbot/test$ export BLOCKCHAINCONF=testnet
eth@ethnode:~/ethbot/test$ nodejs balance_bot.js
[16.04.2017 11:08:06.712] [INFO]  [30330] Starting Ethereum Telegram Bot with ENV: testnet EthGarant_bot_PROD
[16.04.2017 11:08:06.717] [INFO]  [30330] BLOCKCHAINCONF: testnet
[16.04.2017 11:08:06.719] [INFO]  [30330] BOTCONF: EthGarant_bot_PROD
[16.04.2017 11:08:07.418] [LOG]   [30330] Это баланс бота: 165263571570474004
```

Всё готово запускаем для теста:
```
eth@ethnode:~/ethbot/test$ export BLOCKCHAINCONF=testnet
eth@ethnode:~/ethbot/test$ export BOTCONF=EthGarant_bot_PROD
eth@ethnode:~/ethbot$ nodejs eth_bot.js
[16.04.2017 11:07:07.638] [INFO]  [30297] Starting Ethereum Telegram Bot with ENV: testnet EthGarant_bot_PROD
[16.04.2017 11:07:07.644] [INFO]  [30297] BLOCKCHAINCONF: testnet
[16.04.2017 11:07:07.646] [INFO]  [30297] BOTCONF: EthGarant_bot_PROD
[16.04.2017 11:07:08.708] [INFO]  [30297] Bot WebHook https://eth.j2u.ru:8443 сreating...
[16.04.2017 11:07:08.848] [INFO]  [30297] WebHook created
[16.04.2017 11:07:08.848] [INFO]  [30297] Connecting to Database...
[16.04.2017 11:07:08.887] [INFO]  [30297] Database is connected
[16.04.2017 11:07:08.887] [INFO]  [30297] Test connection to Ethereum Node. Trying to check Bot balance...
[16.04.2017 11:07:09.176] [INFO]  [30297] Connection good. Bot balance is 165263571570474004
[16.04.2017 11:07:09.178] [INFO]  [30297] Starting Telegram Bot...
[16.04.2017 11:07:09.198] [INFO]  [30297] Bot name is Ethereum Garant
[16.04.2017 11:07:09.199] [INFO]  [30297] Bot id is 341223987.
[16.04.2017 11:07:09.199] [INFO]  [30297] And Bot username is @EthGarant_bot
[16.04.2017 11:07:09.199] [INFO]  [30297] We Hook URL on https://eth.j2u.ru:8443
[16.04.2017 11:07:09.199] [INFO]  [30297] Ethereum Node is https://eth.j2u.ru:8766
[16.04.2017 11:07:09.200] [INFO]  [30297] Bot address for saving ETH is 0xd304421e38b8A3b10a917A4E38AA3a65d51823F6
[16.04.2017 11:07:09.200] [INFO]  [30297] Bot contract address for benz is 0x5031bd3cab08a6fbe481009903a6fd4a758a0210
[16.04.2017 11:07:09.201] [INFO]  [30297] Bot started. Waiting commands from users

```

## Анализ финансов реальном блокчейне
	Комиссия для держателя		Комиссия для участника	Комиссия для бота	Сумма переводов
Заправка		0.00068326	0			0			0.05
Создание контракта	0		0			0.01512374		0
Перевод на контракт	0		0.00094462		0			0.075
Возврат			0		0			0.00118588		0.075
Итого			0.00068326	0.00094462		0.01630962		0.2
				
				ETH		~USD (курс 46 ETH)	~RUB (курс 60 USD)	
Заработок бота			0.03369038	1.54975748		92.9854488	
Траты держателя без переводов	0.05068326	2.33142996		139.8857976	
Траты участника			0.00094462	0.04345252		2.6071512	
Испарилось			0.0179375	0.825125		49.5075	


Видно, что очень много газа тратится на создание контракта, сумма на порядок больше цифр по транзакциям. Возможно стоит задуматься над переводом алгоритма на создание общего контракта для всех складчин. Это не так удобно с точки зрения отправителей, им придётся указывать в транзакции идентификатор складчины, зато будет явно дешевле.

По данным чата:
```
/start@EthGarant_bot

[1:55:25 AM] Ethereum Garant:
Будете ли вы участвовать в складчине?
У вас есть 20 секунд для регистрации
Пользователь Viktor Fink(@vfink) сказал: Да
Пользователь Siebel Work(@siebel) сказал: Да
 Итого зарегистрировались: 
Viktor Fink (@vfink)
Siebel Work (@siebel)
Только эти участники смогут скидываться
 Теперь выберите держателя складчины
Viktor Fink проголосовал за: Viktor Fink
Siebel Work проголосовал за: Viktor Fink
 Держателем складчины выбран: Viktor Fink
 @vfink сколько денег собираем? 
Последняя цена за 1 ETH на cex.io 48.79270142 USD (американский доллар)
[1:56:57 AM] Viktor Fink:
> Ethereum Garant
> @vfink сколько денег собираем? Последняя цена за 1 ETH на cex.i
0.15

[1:56:57 AM] Ethereum Garant:
@vfink сколько времени будем собирать?
[1:57:00 AM] Viktor Fink:
> Ethereum Garant
> @vfink сколько времени будем собирать?
15 минут

[1:57:01 AM] Ethereum Garant:
Складчина готова к старту 
Её держателем является Viktor Fink с логином @vfink
Общая сумма складчины 0.15 ETH. Продолжительность сбора 15мин. 
Следующим сообщением я попрошу каждого прислать мне номер своего Эфир кошелька для отслеживания платежей 
Отправка адреса подтверждает ваше участие в складчине. Будте внимательны, вводите корректные адреса
 Укажите адрес кошелька
[1:57:28 AM] Viktor Fink:
> Ethereum Garant
> Укажите адрес кошелька
0x581c418e52a8D8108306E9B5a7263e33250e780a
[1:57:56 AM] Siebel Work:
> Ethereum Garant
> Укажите адрес кошелька
0xC52921B239D63ceB01243D921185356Bab781F45

[1:57:56 AM] Ethereum Garant:
Почти готово 
Список адресов кошельков и участников следующий: 
0x581c418e52a8D8108306E9B5a7263e33250e780a - @vfink
0xC52921B239D63ceB01243D921185356Bab781F45 - @siebel
Все должны скинуться по: 0.075 ETH
Мне потребуется немного на бензин, как только меня заправят, я создам контракт в Эфире
По правилам заправлять будет держатель складчины @vfink
 @vfink переведи мне 0.05 ETH на адрес
0x2725a508e6f584303214a05522f7ec8757e34f90
Укажи в данных к транзакции следующий код: 
0x1f9d2e2da9cdbc3e7f69fd02465e2545071ab1297c61cde556931fcfe8f98ac8
Внимание! Неидентифицированные платежи (без указания кода) идут в мою пользу
Я жду...
 Пришла транзакция на 0.05 ETH, я заправлен. Начинаю создавать контракт на складчину в Эфире
 Транзакция на создание контракта отправлена успешно
Хэш транзакции: 0x1340a8397c11c825db25d286884ca2be930632d238a3af3d34bcfadbcc987a6d
Дополнительную информацию о статусе транзакции можно посмотреть здесь 
https://etherscan.io/tx/0x1340a8397c11c825db25d286884ca2be930632d238a3af3d34bcfadbcc987a6d
Я жду майнинга транзакции контракта скалдчины...
etherscan.io
Ethereum Transaction 0x1340a8397c11c825db25d286884ca2be930632d238a3af3d34bcfadbcc987a6d
The Ethereum BlockChain Explorer, API and Analytics Platform
 Контракт успешно создан в Эфире
Его адрес: 0x9a84f2aec652fd5b55ef07b3551af3701def09fb
Всем участникам складчины переводить деньги на ЭТОТ адрес!
Когда все участники скинутся, складчина завершится и средства поступят на счет держателя
Узнать статус сбора можно командой /status 
Завершить складчину по истечению срока можно командой /vozvr 
Я буду сообщать о поступлениях сюда...
[2:01:20 AM] Siebel Work:
/status@EthGarant_bot

[2:01:21 AM] Ethereum Garant:
Складчина создана в Эфире
Текущее состояние контракта на 2017-04-16 23:01:20:
Адрес контракта: 0x9a84f2aec652fd5b55ef07b3551af3701def09fb
Статус: 0-Идет сбор
Срок окончания: 2017-04-16 23:14:54
Сумма складчины: 0.15 ETH
Адрес кошелька держателя: 0x581c418e52a8d8108306e9b5a7263e33250e780a
Адрес кошелька бота: 0x56194ce8177f4baada5c17210c72ca270452735f
Участники и суммы: 
Участник #0:
Адрес: 0x581c418e52a8d8108306e9b5a7263e33250e780a
Логин: @vfink
Сумма: 0 ETH
Участник #1:
Адрес: 0xc52921b239d63ceb01243d921185356bab781f45
Логин: @siebel
Сумма: 0 ETH
Все должны скинуться по: 0.075 ETH
 Пришла транзакция на 0.075 ETH с адреса 0xc52921b239d63ceb01243d921185356bab781f45
[2:04:32 AM] Siebel Work:
/status@EthGarant_bot

[2:04:33 AM] Ethereum Garant:
Складчина создана в Эфире
Текущее состояние контракта на 2017-04-16 23:04:32:
Адрес контракта: 0x9a84f2aec652fd5b55ef07b3551af3701def09fb
Статус: 0-Идет сбор
Срок окончания: 2017-04-16 23:14:54
Сумма складчины: 0.15 ETH
Адрес кошелька держателя: 0x581c418e52a8d8108306e9b5a7263e33250e780a
Адрес кошелька бота: 0x56194ce8177f4baada5c17210c72ca270452735f
Участники и суммы: 
Участник #0:
Адрес: 0x581c418e52a8d8108306e9b5a7263e33250e780a
Логин: @vfink
Сумма: 0 ETH
Участник #1:
Адрес: 0xc52921b239d63ceb01243d921185356bab781f45
Логин: @siebel
Сумма: 0.075 ETH
Все должны скинуться по: 0.075 ETH
 Складчина создана в Эфире
Текущее состояние контракта на 2017-04-16 23:04:34:
Адрес контракта: 0x9a84f2aec652fd5b55ef07b3551af3701def09fb
Статус: 0-Идет сбор
Срок окончания: 2017-04-16 23:14:54
Сумма складчины: 0.15 ETH
Адрес кошелька держателя: 0x581c418e52a8d8108306e9b5a7263e33250e780a
Адрес кошелька бота: 0x56194ce8177f4baada5c17210c72ca270452735f
Участники и суммы: 
Участник #0:
Адрес: 0x581c418e52a8d8108306e9b5a7263e33250e780a
Логин: @vfink
Сумма: 0 ETH
Участник #1:
Адрес: 0xc52921b239d63ceb01243d921185356bab781f45
Логин: @siebel
Сумма: 0.075 ETH
Все должны скинуться по: 0.075 ETH
 Складчина создана в Эфире
Текущее состояние контракта на 2017-04-16 23:04:38:
Адрес контракта: 0x9a84f2aec652fd5b55ef07b3551af3701def09fb
Статус: 0-Идет сбор
Срок окончания: 2017-04-16 23:14:54
Сумма складчины: 0.15 ETH
Адрес кошелька держателя: 0x581c418e52a8d8108306e9b5a7263e33250e780a
Адрес кошелька бота: 0x56194ce8177f4baada5c17210c72ca270452735f
Участники и суммы: 
Участник #0:
Адрес: 0x581c418e52a8d8108306e9b5a7263e33250e780a
Логин: @vfink
Сумма: 0 ETH
Участник #1:
Адрес: 0xc52921b239d63ceb01243d921185356bab781f45
Логин: @siebel
Сумма: 0.075 ETH
Все должны скинуться по: 0.075 ETH
 Складчина создана в Эфире
Текущее состояние контракта на 2017-04-16 23:04:46:
Адрес контракта: 0x9a84f2aec652fd5b55ef07b3551af3701def09fb
Статус: 0-Идет сбор
Срок окончания: 2017-04-16 23:14:54
Сумма складчины: 0.15 ETH
Адрес кошелька держателя: 0x581c418e52a8d8108306e9b5a7263e33250e780a
Адрес кошелька бота: 0x56194ce8177f4baada5c17210c72ca270452735f
Участники и суммы: 
Участник #0:
Адрес: 0x581c418e52a8d8108306e9b5a7263e33250e780a
Логин: @vfink
Сумма: 0 ETH
Участник #1:
Адрес: 0xc52921b239d63ceb01243d921185356bab781f45
Логин: @siebel
Сумма: 0.075 ETH
Все должны скинуться по: 0.075 ETH
[2:06:40 AM] Siebel Work:
/status

[2:06:41 AM] Ethereum Garant:
Складчина создана в Эфире
Текущее состояние контракта на 2017-04-16 23:06:40:
Адрес контракта: 0x9a84f2aec652fd5b55ef07b3551af3701def09fb
Статус: 0-Идет сбор
Срок окончания: 2017-04-16 23:14:54
Сумма складчины: 0.15 ETH
Адрес кошелька держателя: 0x581c418e52a8d8108306e9b5a7263e33250e780a
Адрес кошелька бота: 0x56194ce8177f4baada5c17210c72ca270452735f
Участники и суммы: 
Участник #0:
Адрес: 0x581c418e52a8d8108306e9b5a7263e33250e780a
Логин: @vfink
Сумма: 0 ETH
Участник #1:
Адрес: 0xc52921b239d63ceb01243d921185356bab781f45
Логин: @siebel
Сумма: 0.075 ETH
Все должны скинуться по: 0.075 ETH
[2:07:15 AM] Siebel Work:
/vozvr@EthGarant_bot

[2:07:16 AM] Ethereum Garant:
Срок окончания складчины ещё не подошлёл. Вовзрат средств возможен только после: 2017-04-16 23:14:54
Текущее время: 2017-04-16 23:07:16
[2:23:22 AM] Siebel Work:
/status

[2:23:23 AM] Ethereum Garant:
Складчина создана в Эфире
Текущее состояние контракта на 2017-04-16 23:23:22:
Адрес контракта: 0x9a84f2aec652fd5b55ef07b3551af3701def09fb
Статус: 0-Идет сбор
Срок окончания: 2017-04-16 23:14:54
Сумма складчины: 0.15 ETH
Адрес кошелька держателя: 0x581c418e52a8d8108306e9b5a7263e33250e780a
Адрес кошелька бота: 0x56194ce8177f4baada5c17210c72ca270452735f
Участники и суммы: 
Участник #0:
Адрес: 0x581c418e52a8d8108306e9b5a7263e33250e780a
Логин: @vfink
Сумма: 0 ETH
Участник #1:
Адрес: 0xc52921b239d63ceb01243d921185356bab781f45
Логин: @siebel
Сумма: 0.075 ETH
Все должны скинуться по: 0.075 ETH
[2:23:40 AM] Siebel Work:
/vozvr@EthGarant_bot

[2:23:41 AM] Ethereum Garant:
Запущена процедура возврата средств...
Детали транзакции здесь https://etherscan.io/tx/0x0a98ec7a409946553c846d28ac232a0e83240e0d43297727bc8c8b1990b9af93
etherscan.io
Ethereum Transaction 0x0a98ec7a409946553c846d28ac232a0e83240e0d43297727bc8c8b1990b9af93
The Ethereum BlockChain Explorer, API and Analytics Platform
 Отправил 0.075 ETH на адрес 0xc52921b239d63ceb01243d921185356bab781f45
 Отправил 0 ETH на адрес 0x56194ce8177f4baada5c17210c72ca270452735f
 Складчина просрочена, средства возвращены участникам
 Я закончил свою работу. До новых встреч! 
Написать разработчику можно сюда vfink@tsconsulting.ru
[3:07:34 AM] Viktor Fink:
/status@EthGarant_bot

[3:07:36 AM] Ethereum Garant:
Складчина просрочена, средства возвращены участникам
Текущее состояние контракта на 2017-04-17 00:07:34:
Адрес контракта: 0x9a84f2aec652fd5b55ef07b3551af3701def09fb
Статус: 2-Не состоялась
Срок окончания: 2017-04-16 23:14:54
Сумма складчины: 0.15 ETH
Адрес кошелька держателя: 0x581c418e52a8d8108306e9b5a7263e33250e780a
Адрес кошелька бота: 0x56194ce8177f4baada5c17210c72ca270452735f
Участники и суммы: 
Участник #0:
Адрес: 0x581c418e52a8d8108306e9b5a7263e33250e780a
Логин: @vfink
Сумма: 0 ETH
Участник #1:
Адрес: 0xc52921b239d63ceb01243d921185356bab781f45
Логин: @siebel
Сумма: 0.075 ETH
Все должны скинуться по: 0.075 ETH
```
## License
MIT
