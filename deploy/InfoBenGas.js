/*
pragma solidity ^0.4.0;
contract InfoBenGas {
    address public owner;
    uint public benzin;
    
    function InfoBenGas(uint _benzin) {
        //Это кошелёк бота, сюда стекаются все деньги
        owner = msg.sender;
        //Сумма предоплаты за бензин
        benzin = _benzin;
    }
    
    event DepositMade(address _from, uint _value, bytes _chatid);
    
    function() payable {
        if (msg.value > 0) {
            if (msg.value >= benzin) DepositMade(msg.sender, msg.value, msg.data);
            //Переводим все поступившие деньги на бота
            owner.transfer(this.balance);
        }
    }
    
    function kill()
    { 
        if (msg.sender == owner)
            suicide(owner);
    }
}
}*/

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

var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(blockchainconf.nodeurl));

var _benzin = web3.toWei(blockchainconf.botgas, 'ether');

//Кодируем параметры
var SolidityCoder = require("web3/lib/solidity/coder.js");
var encodePar = SolidityCoder.encodeParams(["uint256"], [_benzin]);

//Скомпилированный контракт
var data = conf.blockchain.botcode;
data += encodePar;

//Создаем траназкцию
var Transaction = require ('ethereumjs-tx');
var tx = new Transaction(null, 1);
tx.nonce = web3.toHex(web3.eth.getTransactionCount(blockchainconf.botbackaddr));
tx.gasPrice = web3.toHex(web3.eth.gasPrice);
tx.value = '0x00';
var gas = 300000;
tx.gasLimit = web3.toHex(gas);
tx.data = data;


//Подписываем транзакцию
var botprivateKey = new Buffer(blockchainconf.botprivateKey, 'hex');
tx.sign(botprivateKey); 

//Проверяем
var v = tx.validate();
if (!v) {
  console.log(v);
  process.exit(1);
}
else {
    //Отправляем
    web3.eth.sendRawTransaction('0x' + tx.serialize().toString('hex'), function(err, hash) {
        var txt = '';
        if (!err) {
            console.log(web3.eth.getTransaction(hash));
            
            txt = 'Транзакция на создание контракта отправлена успешно\n';
            txt += 'Хэш транзакции: ' + hash + '\n';
            txt += 'Дополнительную информацию о статусе транзакции можно посмотреть здесь \n';
            txt += 'https://etherscan.io/tx/' + hash + '\n';
            txt += 'Я жду майнинга транзакции контракта...';
            console.log(txt);
            var  filter = web3.eth.filter('latest');
            filter.watch(function(error, result) {
                if (!error){
                  var receipt = web3.eth.getTransactionReceipt(hash);
                  if (receipt && receipt.transactionHash == hash) {
                    if (receipt.gasUsed < gas) {
                        console.log('Намайнили контракт для сбора на бензин! Адрес: ' + receipt.contractAddress);
                        console.log('Вставьте в конфинг файл среды строку: config.botaddr = \'' + receipt.contractAddress + '\';');
                        filter.stopWatching();
                        process.exit(0);
                    }
                    else {
                        console.log('Не хватило бензина для транзакции: ' + receipt.transactionHash);
                        process.exit(1);
                    }
                  }  
                  console.log(receipt);
                }
                else {
                    console.log(err);
                    process.exit(1);
                }
            });
        }
        else {
          console.log(err);
          txt = 'Ошибка отправки транзакции на создание контракта: ' + err + '\n';
          console.log(txt);
          process.exit(1);
        }
    });
}