const { DataTypes } = require('sequelize');

// 管理员表模型 - 兼容OLD项目的jz_level表
module.exports = (sequelize, DB_PREFIX) => {
  const Level = sequelize.define('Level', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '管理员ID'
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '登录用户名'
    },
    password: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: '登录密码(MD5)'
    },
    gid: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '角色组ID'
    },
    purviews: {
      type: DataTypes.TEXT,
      comment: '权限设置'
    },
    name: {
      type: DataTypes.STRING(50),
      comment: '真实姓名'
    },
    phone: {
      type: DataTypes.STRING(20),
      comment: '联系电话'
    },
    email: {
      type: DataTypes.STRING(50),
      comment: '邮箱地址'
    },
    isadmin: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
      comment: '是否超级管理员'
    },
    classcontrol: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
      comment: '栏目控制权限'
    },
    login_num: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '登录次数'
    },
    login_time: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '最后登录时间'
    },
    login_ip: {
      type: DataTypes.STRING(20),
      comment: '最后登录IP'
    },
    addtime: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '添加时间'
    },
    issystem: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
      comment: '是否系统用户'
    }
  }, {
    tableName: `${DB_PREFIX}level`,
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    engine: 'MyISAM',
    comment: '管理员表'
  });

  return Level;
};