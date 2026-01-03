const { DataTypes } = require('sequelize');

// 字段表模型 - 兼容OLD项目的jz_fields表
module.exports = (sequelize, DB_PREFIX) => {
  const Fields = sequelize.define('Fields', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '字段ID'
    },
    field: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '字段名'
    },
    fieldname: {
      type: DataTypes.STRING(50),
      comment: '字段标题'
    },
    molds: {
      type: DataTypes.STRING(50),
      comment: '所属模型'
    },
    fieldtype: {
      type: DataTypes.TINYINT(2),
      defaultValue: 1,
      comment: '字段类型'
    },
    fieldlong: {
      type: DataTypes.INTEGER,
      defaultValue: 255,
      comment: '字段长度'
    },
    tips: {
      type: DataTypes.STRING(255),
      comment: '字段提示'
    },
    ismust: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
      comment: '是否必填'
    },
    isshow: {
      type: DataTypes.TINYINT(1),
      defaultValue: 1,
      comment: '是否显示'
    },
    islist: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
      comment: '是否在列表显示'
    },
    vdata: {
      type: DataTypes.TEXT,
      comment: '字段选项值'
    },
    defaultvalue: {
      type: DataTypes.TEXT,
      comment: '默认值'
    },
    tids: {
      type: DataTypes.TEXT,
      comment: '栏目限制'
    },
    listorders: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    issystem: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
      comment: '是否系统字段'
    }
  }, {
    tableName: `${DB_PREFIX}fields`,
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    engine: 'MyISAM',
    comment: '字段表'
  });

  return Fields;
};