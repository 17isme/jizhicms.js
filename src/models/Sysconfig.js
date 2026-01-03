const { DataTypes } = require('sequelize');

// 系统配置表模型 - 兼容OLD项目的jz_sysconfig表
module.exports = (sequelize, DB_PREFIX) => {
  const Sysconfig = sequelize.define('Sysconfig', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '配置ID'
    },
    field: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '配置字段'
    },
    title: {
      type: DataTypes.STRING(50),
      comment: '配置标题'
    },
    tip: {
      type: DataTypes.STRING(255),
      comment: '配置提示'
    },
    type: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
      comment: '配置类型'
    },
    data: {
      type: DataTypes.TEXT,
      comment: '配置值'
    },
    listorders: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    issystem: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
      comment: '是否系统配置'
    }
  }, {
    tableName: `${DB_PREFIX}sysconfig`,
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    engine: 'MyISAM',
    comment: '系统配置表'
  });

  return Sysconfig;
};