module.exports = {

  
  // HOST: "adminsmart.ckh6xqbfeoiy.us-east-2.rds.amazonaws.com",
  
  // USER: "smart_admin",
  
  // PASSWORD: "Smart123",
  
  // DB: "smartstation",
  
  // dialect: "mysql",

  HOST: "localhost",
  
  USER: "root",
  
  PASSWORD: "",
  
  DB: "server_smart_station",
  
  //DB: "smart_station_new",
  // HOST: "103.191.208.50",
  
  // USER: "xvpsvilv_smart_admin",
  
  // PASSWORD: "Smartcreation@8655!",
  
  // DB: "xvpsvilv_smart_station",
  
  // PORT: "3306",
  
  dialect: "mysql",

  charset : 'utf8mb4',
  
  pool: {
  
  max: 5,
  
  min: 0,
  
  acquire: 30000,
  
  idle: 10000
  
  }
  };