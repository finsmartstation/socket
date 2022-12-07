var mysql = require('mysql');
var con = mysql.createConnection({
    host: "localhost",
    user: "xvpsvilv_smart_admin",
    password: "Smartcreation@8655!",
    database:"xvpsvilv_smart_station",
     charset : 'utf8mb4'
  });
 console.log('Db connected') 



// var con = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database:"erp",
//   charset : 'utf8mb4'
// });

// var con = mysql.createConnection({
//     host: "finsmartstation.com:21",
//     user: "u347825043_ss_user",
//     password: "Password@123",
//     database:"u347825043_ss_erp",
//      charset : 'utf8mb4'
//   });


module.exports = con;
