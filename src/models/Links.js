const { DataTypes } = require('sequelize');

// 友情链接表模型 - 兼容OLD项目的jz_links表
module.exports = (sequelize, DB_PREFIX) => {
  const Links = sequelize.define('Links', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '链接ID'
    },
    title: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '链接名称'
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '链接地址'
    },
    logo: {
      type: DataTypes.STRING(255),
      comment: 'LOGO图片'
    },
    description: {
      type: DataTypes.STRING(255),
      comment: '链接描述'
    },
    type: {
      type: DataTypes.TINYINT(1),
      defaultValue: 1,
      comment: '链接类型'
    },
    orders: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    isshow: {
      type: DataTypes.TINYINT(1),
      defaultValue: 1,
      comment: '是否显示'
    },
    addtime: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '添加时间'
    }
  }, {
    tableName: `${DB_PREFIX}links`,
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    engine: 'MyISAM',
    comment: '友情链接表'
  });

  return Links;
};