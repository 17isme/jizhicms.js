const { DataTypes } = require('sequelize');

// 评论表模型 - 兼容OLD项目的jz_comment表
module.exports = (sequelize, DB_PREFIX) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '评论ID'
    },
    aid: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '文章ID'
    },
    member_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '会员ID'
    },
    nickname: {
      type: DataTypes.STRING(50),
      comment: '昵称'
    },
    email: {
      type: DataTypes.STRING(50),
      comment: '邮箱'
    },
    face: {
      type: DataTypes.STRING(255),
      comment: '头像'
    },
    content: {
      type: DataTypes.TEXT,
      comment: '评论内容'
    },
    pid: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '父评论ID'
    },
    isshow: {
      type: DataTypes.TINYINT(1),
      defaultValue: 1,
      comment: '是否显示'
    },
    zan: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '点赞数'
    },
    ip: {
      type: DataTypes.STRING(20),
      comment: 'IP地址'
    },
    addtime: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '评论时间'
    }
  }, {
    tableName: `${DB_PREFIX}comment`,
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    engine: 'MyISAM',
    comment: '评论表'
  });

  return Comment;
};