var getrate = function (cb) {
  var req = require('https');
  var url = 'https://cex.io/api/last_price/ETH/USD';
  var rate = '';
  
  try {  
    req.get(url, function(res){
      var body = "";
      res.on('data', function(data) {
        body += data;
      });
      res.on('end', function() {
        var data = JSON.parse(body);
        rate = 'Последняя цена за 1 ETH на cex.io ' + data.lprice + ' USD (американский доллар)';
        //console.log(body);
        //вызов Call Back
        if (cb) cb(rate);
      });
      res.on('error', function(e) {
        console.log("Got error: " + e.message);
        //вызов Call Back даже в случае ошики
        if (cb) cb(rate);
      });
    });
  } catch (e) {
    console.log("Got error: " + e.message);
    if (cb) cb(rate);
  }
};

module.exports.getrate = getrate;