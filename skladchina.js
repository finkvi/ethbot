/*
pragma solidity ^0.4.0;
contract skladchina {
    address public derzhatel_addr;      //Адрес держателя складчины
    address public bot_addr;            //Адрес бота для вывода остатков
    uint public summa_sklad;            //Сумма складчины
    uint public srok;                   //Дата, до которой идёт сбор средств
    Uchastnik [] public uchastniki;     //Массив всех участников
    uint public status;                 //Статус складчины, варианты: 
                                        //"0-Идет сбор", "1-Состоялась", "2-Не состоялась, кончилось время" 
    struct Uchastnik {
        address addr;                   //Адрес участника
        bytes32 userid;                 //Логин
        uint summa;                     //Сколько денег отправил
    }
    
    event NewMoney(address _from, uint _value); //Событие о поступении денег
    event ChangeStatus(uint _status);           //Изменение статуса складчины
    event SendMoney(address _from, uint _value);//События о раздаче денег
    
    //Запускается при деплое контракта, параметрами передаём из вне условия
    function skladchina (address _derzhatel_addr
                        ,address _bot_addr
                        ,uint _summa_sklad
                        ,uint _srok
                        ,address[] _uchastniki_addr
                        ,bytes32[] _userid
    ) {
        derzhatel_addr = _derzhatel_addr;
        bot_addr = _bot_addr;
        summa_sklad = _summa_sklad;
        srok = now + _srok * 1 minutes;
        status = 0;
        
        for (uint i = 0; i < _uchastniki_addr.length; i++) {
            uchastniki.push;
            uchastniki.push(Uchastnik({
                addr:   _uchastniki_addr[i],
                userid: _userid[i],
                summa:  0
            }));
        }
    }
    
    //Любая транзакция
    function () payable{
        //Если состояние - Идёт сбор
        if (status == 0) {
            if (msg.value > 0) {
                NewMoney (msg.sender, msg.value);
                bool done = true;
                bool plus = false;
                for (uint i = 0; i < uchastniki.length; i++) {
                    if (uchastniki[i].addr == msg.sender) {
                        plus = true;
                        uchastniki[i].summa += msg.value;
                    }
                    if (uchastniki[i].summa < (summa_sklad / uchastniki.length)) {
                        done = false;
                    }
                    if (plus && !done) break;
                }
                if (done) {
                    //Переводим складчину на держателя
                    SendMoney(derzhatel_addr, summa_sklad);
                    derzhatel_addr.transfer(summa_sklad);
                    //Остаток боту
                    SendMoney(bot_addr, this.balance);
                    bot_addr.transfer(this.balance);
                    //Меняем статус складчины навсегда
                    status = 1;
                    ChangeStatus(status);
                }
            }
        }
        else {
            if (msg.value > 0) {
                //Кто-то переводит деньги, когда складчина уже закончилась, всё идёт боту:)
                SendMoney(bot_addr, this.balance);
                bot_addr.transfer(this.balance);
            }
        }
    }
    
    //Возврат денег участникам
    function vozvrat() payable{
        if (now >= srok && status == 0) {
            for (uint i = 0; i < uchastniki.length; i++) {
                //Раздаем обратно, если участник скидывал нужную сумму
                //Если больше, вернётся все равно только доля, остальное боту
                uint s = summa_sklad / uchastniki.length;
                if (uchastniki[i].summa >= s) {
                    uchastniki[i].addr.transfer(s);
                    SendMoney(uchastniki[i].addr, s);
                }
            }
            //Остаток боту
            SendMoney(bot_addr, this.balance);
            bot_addr.transfer(this.balance);
            //Меняем статус складчины навсегда
            status = 2;
            ChangeStatus(status);
        }
    }
}
*/



var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('https://test-bot-finkvi.c9users.io:8081'));

var _derzhatel_addr = '0xC50645Df8e6db163dDa1E0bAD48fedC014c6438f' ;
var _bot_addr = '0xcfc5fBb074447A9bB6A0dC1Cd76aF7D1a597Da3d';
var _summa_sklad = 21000000000000000000;
var _srok = 1440;
var addr = ['0xF45B49B83Eab56112e5d8c802094568BE0CaA48d', '0xC50645Df8e6db163dDa1E0bAD48fedC014c6438f'];
var userid = ['vfink', 'siebel'];
var _uchastniki_addr = addr;
var _userid = userid;

var skladchina_sol_skladchinaContract = web3.eth.contract([{"constant":true,"inputs":[],"name":"bot_addr","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"status","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"uchastniki","outputs":[{"name":"addr","type":"address"},{"name":"userid","type":"bytes32"},{"name":"summa","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"srok","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"summa_sklad","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"vozvrat","outputs":[],"payable":true,"type":"function"},{"constant":true,"inputs":[],"name":"derzhatel_addr","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"inputs":[{"name":"_derzhatel_addr","type":"address"},{"name":"_bot_addr","type":"address"},{"name":"_summa_sklad","type":"uint256"},{"name":"_srok","type":"uint256"},{"name":"_uchastniki_addr","type":"address[]"},{"name":"_userid","type":"bytes32[]"}],"payable":false,"type":"constructor"},{"payable":true,"type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_from","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"NewMoney","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_status","type":"uint256"}],"name":"ChangeStatus","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_from","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"SendMoney","type":"event"}]);
var skladchina_sol_skladchina = skladchina_sol_skladchinaContract.new(
   _derzhatel_addr,
   _bot_addr,
   _summa_sklad,
   _srok,
   _uchastniki_addr,
   _userid,
   {
     from: web3.eth.accounts[0], 
     data: '0x6060604052341561000c57fe5b60405161088638038061088683398101604090815281516020830151918301516060840151608085015160a086015193959293919290810191015b60008054600160a060020a03808916600160a060020a03199283161783556001805491891691909216179055600285905542603c85020160035560058190555b82518110156101465760048054600181016100a28382610153565b916000526020600020906003020160005b60606040519081016040528087868151811015156100cd57fe5b90602001906020020151600160a060020a0316815260200186868151811015156100f357fe5b602090810291909101810151825260009181019190915281518454600160a060020a031916600160a060020a0390911617845581015160018401556040015160029092019190915550505b600101610087565b5b505050505050506101be565b81548183558181151161017f5760030281600302836000526020600020918201910161017f9190610185565b5b505050565b6101bb91905b808211156101b7578054600160a060020a0319168155600060018201819055600282015560030161018b565b5090565b90565b6106b9806101cd6000396000f300606060405236156100675763ffffffff60e060020a60003504166307fb4e58811461033f578063200d2ed21461036b57806331af22331461038d57806372d8e1a1146103c857806384cd46bc146103ea578063d2f8467f1461040c578063ef92ebde14610416575b61033d5b600060006000600554600014156102c25760003411156102bc5760408051600160a060020a033316815234602082015281517f09df2cb91670081c8e82106028cc3931db1f8e4a1967fad093e4bb858b2cc08f929181900390910190a1506001915060009050805b6004548110156101a75733600160a060020a03166004828154811015156100f657fe5b906000526020600020906003020160005b5054600160a060020a0316141561014957600191503460048281548110151561012c57fe5b906000526020600020906003020160005b50600201805490910190555b60045460025481151561015857fe5b0460048281548110151561016857fe5b906000526020600020906003020160005b5060020154101561018957600092505b818015610194575082155b1561019e576101a7565b5b6001016100d3565b82156102bc5760005460025460408051600160a060020a0390931683526020830191909152805160008051602061066e8339815191529281900390910190a160008054600254604051600160a060020a039092169281156108fc029290818181858888f19350505050151561021857fe5b60015460408051600160a060020a03928316815230909216316020830152805160008051602061066e8339815191529281900390910190a1600154604051600160a060020a039182169130163180156108fc02916000818181858888f19350505050151561028257fe5b6001600581905560408051918252517ff6658b501d055edb49a6cbe68c5c772781280b840609bc8af5698f455a8215399181900360200190a15b5b610335565b60003411156103355760015460408051600160a060020a03928316815230909216316020830152805160008051602061066e8339815191529281900390910190a1600154604051600160a060020a039182169130163180156108fc02916000818181858888f19350505050151561033557fe5b5b5b5b505050565b005b341561034757fe5b61034f610442565b60408051600160a060020a039092168252519081900360200190f35b341561037357fe5b61037b610451565b60408051918252519081900360200190f35b341561039557fe5b6103a0600435610457565b60408051600160a060020a039094168452602084019290925282820152519081900360600190f35b34156103d057fe5b61037b610494565b60408051918252519081900360200190f35b34156103f257fe5b61037b61049a565b60408051918252519081900360200190f35b61033d6104a0565b005b341561041e57fe5b61034f61065e565b60408051600160a060020a039092168252519081900360200190f35b600154600160a060020a031681565b60055481565b600480548290811061046557fe5b906000526020600020906003020160005b5080546001820154600290920154600160a060020a03909116925083565b60035481565b60025481565b6000600060035442101580156104b65750600554155b1561065957600091505b6004548210156105b5576004546002548115156104d957fe5b049050806004838154811015156104ec57fe5b906000526020600020906003020160005b5060020154106105a957600480548390811061051557fe5b906000526020600020906003020160005b5054604051600160a060020a039091169082156108fc029083906000818181858888f19350505050151561055657fe5b60008051602061066e83398151915260048381548110151561057457fe5b906000526020600020906003020160005b505460408051600160a060020a039092168252602082018490528051918290030190a15b5b6001909101906104c0565b60015460408051600160a060020a03928316815230909216316020830152805160008051602061066e8339815191529281900390910190a1600154604051600160a060020a039182169130163180156108fc02916000818181858888f19350505050151561061f57fe5b6002600581905560408051918252517ff6658b501d055edb49a6cbe68c5c772781280b840609bc8af5698f455a8215399181900360200190a15b5b5050565b600054600160a060020a0316815600c957d95850105ff100344003b8fa6b64196eb8f8b16ff28e111a87dee1a01c49a165627a7a72305820bd6ea64d844d4c3811cc1a588f66a5bc70a6814f2cf1a35939e3bf196da451970029', 
     gas: '4700000'
   }, function (e, contract){
    console.log(e, contract);
    if (typeof contract.address !== 'undefined') {
         console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
    }
 })