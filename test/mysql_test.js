require("console-stamp")(console, {
    pattern:"dd.mm.yyyy HH:MM:ss.l",
    metadata:'[' + process.pid + ']',
});
////////////////////////CONFIG SECTION////////////////////////////////
const conf = require('../conf');
////////////////////////CONFIG SECTION////////////////////////////////

var mysql = require('mysql');
// Initialize pool
var pool = mysql.createPool(conf.DBPOOL);

pool.query("SELECT 1", function(err, rows, fields) {
    if(err) throw err;
    console.log('1');
});

for(var i = 0; i < 15; ++i) {
  pool.query("SELECT SLEEP(2), ? AS i", [i], function(err, rows, fields) {
    if(err) throw err;
    console.log("Slept: " + rows[0].i);
  });
}

// function executeQuery(query, params, callback){
//     pool.getConnection(function(err,connection){
//         if (err) {
//           connection.release();
//           throw err;
//         }   
//         connection.query(query, params, function(err,rows){
//             connection.release();
//             if(!err) {
//                 callback(null, {rows: rows});
//             }           
//         });
//         connection.on('error', function(err) {      
//               throw err;
//         });
//     });
// }

// for(var i = 0; i < 10; ++i) {
//   executeQuery("SELECT SLEEP(2), ? AS i", [i], function(err, rows, fields) {
//     if(err) throw err;
//     console.log("Slept: " + rows[0].i);
      
//   });
// }