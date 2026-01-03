const { DataTypes } = require('sequelize');

// 模型表模型 - 兼容OLD项目的jz_molds表
module.exports = (sequelize, DB_PREFIX) => {
  const Molds = sequelize.define('Molds', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '模型ID'
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '模型名称'
    },
    biaoshi: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '模型标识'
    },
    isclasstype: {
      type: DataTypes.TINYINT(1),
      defaultValue: 1,
      comment: '是否有栏目'
    },
    iscontrol: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
      comment: '是否控制权限'
    },
    template_list: {
      type: DataTypes.STRING(50),
      comment: '列表页模板'
    },
    template_show: {
      type: DataTypes.STRING(50),
      comment: '详情页模板'
    },
    pagesize: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
      comment: '每页显示数量'
    },
    listorders: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    issystem: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
      comment: '是否系统模型'
    },
    addtime: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '添加时间'
    }
  }, {
    tableName: `${DB_PREFIX}molds`,
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    engine: 'MyISAM',
    comment: '模型表'
  });

  return Molds;
};