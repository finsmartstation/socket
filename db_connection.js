var mysql = require('mysql');
var con = mysql.createConnection({
    host: "adminsmart.ckh6xqbfeoiy.us-east-2.rds.amazonaws.com",
    user: "smart_admin",
    password: "Smart123",
    database:"smartstation",
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