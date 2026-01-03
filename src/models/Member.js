const { DataTypes } = require('sequelize');

// 会员表模型 - 兼容OLD项目的jz_member表
module.exports = (sequelize, DB_PREFIX) => {
  const Member = sequelize.define('Member', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '会员ID'
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '用户名'
    },
    password: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: '密码'
    },
    nickname: {
      type: DataTypes.STRING(50),
      comment: '昵称'
    },
    email: {
      type: DataTypes.STRING(50),
      comment: '邮箱'
    },
    phone: {
      type: DataTypes.STRING(20),
      comment: '手机号'
    },
    face: {
      type: DataTypes.STRING(255),
      comment: '头像'
    },
    money: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '余额'
    },
    point: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '积分'
    },
    sex: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
      comment: '性别'
    },
    birthday: {
      type: DataTypes.STRING(20),
      comment: '生日'
    },
    ischeck: {
      type: DataTypes.TINYINT(1),
      defaultValue: 1,
      comment: '是否审核'
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
      comment: '注册时间'
    }
  }, {
    tableName: `${DB_PREFIX}member`,
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    engine: 'MyISAM',
    comment: '会员表'
  });

  return Member;
};