/*
pragma solidity ^0.4.0;
contract InfoBenGas {
    address public owner;
    uint public benzin;
    
    function InfoBenGas() {
        //Это кошелёк бота, сюда стекаются все деньги
        owner = msg.sender;
        //0.01 ETH, столько стоит предоплата на бензни
        benzin = 10000000000000000;
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
*/
var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('https://ethbot-finkvi.c9users.io:8081'));
var bot_back = '0xD931856721149Ed5120BfDfde9A222Cfcbe857Fe';
web3.personal.unlockAccount("0xD931856721149Ed5120BfDfde9A222Cfcbe857Fe", "qaz", 15000);

var untitled_infobengasContract = web3.eth.contract([{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"benzin","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"},{"payable":true,"type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_from","type":"address"},{"indexed":false,"name":"_value","type":"uint256"},{"indexed":false,"name":"_chatid","type":"bytes"}],"name":"DepositMade","type":"event"}]);
var untitled_infobengas = untitled_infobengasContract.new(
   {
     from: bot_back, 
     data: '0x6060604052341561000c57fe5b5b60008054600160a060020a03191633600160a060020a0316179055662386f26fc100006001555b5b6101ca806100446000396000f3006060604052361561003b5763ffffffff60e060020a60003504166341c0e1b581146101015780638da5cb5b14610113578063caa2d9f81461013f575b6100ff5b60003411156100fb5760015434106100c5577faf420991a81cbb3b79c2422d58782b3ae7338569109e83cf9df1482d1e51fa5d33346000366040518085600160a060020a0316600160a060020a03168152602001848152602001806020018281038252848482818152602001925080828437604051920182900397509095505050505050a15b60008054604051600160a060020a0391821692309092163180156108fc0292909190818181858888f1935050505015156100fb57fe5b5b5b565b005b341561010957fe5b6100ff610161565b005b341561011b57fe5b610123610189565b60408051600160a060020a039092168252519081900360200190f35b341561014757fe5b61014f610198565b60408051918252519081900360200190f35b60005433600160a060020a03908116911614156100fb57600054600160a060020a0316ff5b5b565b600054600160a060020a031681565b600154815600a165627a7a723058206a5203541ed0d9b961ec181000968ad9b8d1a6fcff48b5d316620204ded145070029', 
     gas: '4700000'
   }, function (e, contract){
    console.log(e, contract);
    if (typeof contract.address !== 'undefined') {
         console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
    }
 })
 
 //Contract mined! address: 0x94c161e0c7f2c10ecad4c24b34a14e1be5a8ff04 transactionHash: 0xb724e7f37d00b5bf8070231455c63657a9b3fe8e88b41a04868f659a65e20592
 