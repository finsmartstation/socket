//const { dashLogger } = require("../logger");
const dbConfig = require('../db.config');
const Sequelize = require("sequelize");
const Op = Sequelize.Op
const db = {};
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD,  {
  host: dbConfig.HOST,
  //port: dbConfig.PORT,
  dialect: dbConfig.dialect,
  // operatorsAliases: false,
 
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

try{
  db.Sequelize = Sequelize;
  db.sequelize = sequelize;
}catch(e){
  //dashLogger.error(e);
}


// db.tutorials = require("./tutorial.model.js")(sequelize, Sequelize);

module.exports = db;