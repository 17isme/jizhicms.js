const { Sequelize } = require('sequelize');
require('dotenv').config();

// 数据库配置 - 兼容OLD项目
const sequelize = new Sequelize(
  process.env.DB_NAME || 'gzfnet',
  process.env.DB_USER || 'gzfnet', 
  process.env.DB_PASS || 'FXMyhQMyei!',
  {
    host: process.env.DB_HOST || 'mysql57.rdsmd5ukjsfwfvo.rds.su.baidubce.com',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    timezone: '+08:00', // 东八区时区
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      dateStrings: true,
      typeCast: true
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      underscored: false, // 不自动转换驼峰命名为下划线
      freezeTableName: true, // 禁用表名复数化
      timestamps: false // 禁用自动时间戳，使用OLD项目的时间字段
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
);

// 表前缀配置
const DB_PREFIX = process.env.DB_PREFIX || 'jz_';

module.exports = sequelize;
module.exports.DB_PREFIX = DB_PREFIX;