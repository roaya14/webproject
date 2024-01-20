const { Sequelize } = require('sequelize');

const dbConfig = {
  port: 3306,
  host: 'localhost',
  user: 'root',
  password: 'Pass14',
  database: 'web',
};

const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: 'mysql',
  operatorsAliases: false,
  logging: false,
});

module.exports = sequelize;
