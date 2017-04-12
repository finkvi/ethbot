## Telegram Bot + Ethereum 

Бот - договорщик по складчинам. Умная машина гарант сервиса.

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

- Пример неуспешного сбора [здесь](https://github.com/finkvi/ethbot/blob/master/presentation/ExampleYes.pdf)


## Технологии
- Node JS (Telegram Bot + node-telegram-bot-api) для написания бота
- Node JS (Ethereum + web3) для взаимодействия с блокчейном
- Solidity язык умных контрактов
- Среда разработки для Node JS: https://c9.io
- Среда разработки для Solidty: https://remix.ethereum.org
- Локальный кошелек: Ethereum Wallet
- Web кошелек: https://www.myetherwallet.com
- Посмотреть, что происходит в блокчейне здесь: https://etherscan.io/
- Тестовая сеть здесь: https://etherscan.io/

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
        listen 8080 ssl;
        listen [::]:8080 ssl;
        include snippets/ssl-eth.j2u.ru.conf;
        include snippets/ssl-params.conf;

        server_name _;

        location / {
            proxy_pass         http://127.0.0.1:8545/;
            proxy_redirect     off;
            proxy_set_header   Host $host;
            proxy_set_header   X-Real-IP $remote_addr;
            proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Host $server_name;
        }
}

##For Geth Testnet
server {
        listen 8081 ssl;
        listen [::]:8081 ssl;
        include snippets/ssl-eth.j2u.ru.conf;
        include snippets/ssl-params.conf;

        server_name _;

        location / {
            proxy_pass         http://127.0.0.1:8550/;
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
nodejs balance_bot.js testnet EthGarant_bot
Это баланс бота: 115511051570474004
```

Всё готово запускаем для теста:
```
nodejs eth_bot.js testnet EthGarant_bot
Database is connected ... nn
Имя бота Ethereum Garant!
ИД бота 341223987.
And my username is @EthGarant_bot.
URL: https://eth.j2u.ru:8443
Подключен к testnet
Нода https://eth.j2u.ru:8766
Адрес кошелька бота 0xd304421e38b8A3b10a917A4E38AA3a65d51823F6
Адрес контракта бота 0x5031bd3cab08a6fbe481009903a6fd4a758a0210
```


## License
MIT
